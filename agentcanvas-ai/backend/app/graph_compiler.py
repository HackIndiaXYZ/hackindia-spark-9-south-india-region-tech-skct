import os
import json
import logging
from typing import TypedDict, List, Dict, Any, Annotated
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from app.agents.tools import AVAILABLE_TOOLS

logger = logging.getLogger(__name__)

# State definition
class AgentState(TypedDict):
    user_input: str
    messages: List[Dict[str, Any]]
    current_node: str
    logs: List[str]
    variables: Dict[str, Any]

# Helper to format message logs
def add_log(state: AgentState, message: str) -> None:
    state["logs"].append(message)
    logger.info(message)

# Helper to run simulated or real LLM
def execute_llm(model_name: str, prompt: str, user_query: str, history: List[Dict[str, Any]], temperature: float) -> str:
    # Check if real keys exist
    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")
    
    if "gemini" in model_name.lower() and gemini_key:
        try:
            llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=gemini_key, temperature=temperature)
            messages = [SystemMessage(content=prompt)]
            for msg in history:
                if msg.get("role") == "user":
                    messages.append(HumanMessage(content=msg.get("content", "")))
                elif msg.get("role") == "assistant":
                    messages.append(AIMessage(content=msg.get("content", "")))
            messages.append(HumanMessage(content=user_query))
            res = llm.invoke(messages)
            return res.content
        except Exception as e:
            return f"[Real Gemini Error: {str(e)}. Falling back to simulation.]"
            
    elif "gpt" in model_name.lower() and openai_key:
        try:
            llm = ChatOpenAI(model=model_name, api_key=openai_key, temperature=temperature)
            messages = [SystemMessage(content=prompt)]
            for msg in history:
                if msg.get("role") == "user":
                    messages.append(HumanMessage(content=msg.get("content", "")))
                elif msg.get("role") == "assistant":
                    messages.append(AIMessage(content=msg.get("content", "")))
            messages.append(HumanMessage(content=user_query))
            res = llm.invoke(messages)
            return res.content
        except Exception as e:
            return f"[Real OpenAI Error: {str(e)}. Falling back to simulation.]"
            
    # Fallback/Simulation mode
    # Let's construct a smart simulated response based on the system prompt and user query
    query_lower = user_query.lower()
    
    # Process tools description in mock mode
    if "calculator" in query_lower:
        return "I need to perform a mathematical calculation. I will use the calculator tool. Calculation request: " + user_query
    elif "search" in query_lower or "weather" in query_lower or "coimbatore" in query_lower or "hackindia" in query_lower:
        return f"I need to search the web for: '{user_query}'. I'll trigger the web_search tool."
    
    # Generate custom mock output reflecting the agent's identity
    role_match = re_search(r"you are a[n]? (\w+)", prompt.lower())
    role = role_match.group(1) if role_match else "helpful AI assistant"
    
    response = f"[Simulated {model_name}] Since I am configured as a {role}, here is my response to '{user_query}':\n"
    response += f"Based on my custom prompt '{prompt[:60]}...', I have processed your request. "
    
    if "poem" in query_lower or "poetry" in query_lower:
        response += "\n\nRoses are red, agents are blue,\nVisual canvas compiles just for you.\nLangGraph is executing, state is in flight,\nMaking your AI project shine bright!"
    elif "code" in query_lower or "program" in query_lower:
        response += "\n\n```python\n# Simulated python response\ndef hello_world():\n    print(\"Hello from AgentCanvas AI!\")\n```"
    else:
        response += "How else can I assist you with building nodes and edges in your visual canvas?"
        
    return response

def re_search(pattern, text):
    import re
    return re.search(pattern, text)

class GraphCompiler:
    def __init__(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]):
        self.nodes_list = nodes
        self.edges_list = edges
        self.nodes_by_id = {node["id"]: node for node in nodes}
        self.adjacency = {}
        for edge in edges:
            source = edge["source"]
            target = edge["target"]
            source_handle = edge.get("sourceHandle", "default")
            if source not in self.adjacency:
                self.adjacency[source] = []
            self.adjacency[source].append((target, source_handle))

    def compile(self):
        # We need a start node. Usually it is the node of type 'input'
        input_nodes = [node for node in self.nodes_list if node["type"] == "input"]
        if not input_nodes:
            raise ValueError("Graph must contain an Input Node (type: 'input').")
        
        start_node_id = input_nodes[0]["id"]
        
        # Initialize StateGraph
        workflow = StateGraph(AgentState)
        
        # Define functions for each node dynamically
        for node in self.nodes_list:
            node_id = node["id"]
            node_type = node["type"]
            node_data = node.get("data", {})
            node_name = node_data.get("name", node_id)
            
            # We define a function creator to bind the node data
            def make_node_func(n_id, n_type, n_data, n_name):
                def node_func(state: AgentState) -> Dict[str, Any]:
                    state["current_node"] = n_id
                    add_log(state, f"=== Executing Node: {n_name} ({n_type}) ===")
                    
                    if n_type == "input":
                        # Input node passes the user input into messages
                        user_input = state["user_input"]
                        state["messages"].append({"role": "user", "content": user_input})
                        add_log(state, f"Input received: '{user_input}'")
                        
                    elif n_type == "agent":
                        # Agent Node runs LLM
                        model = n_data.get("model", "mock-model")
                        prompt = n_data.get("prompt", "You are a helpful assistant.")
                        temp = float(n_data.get("temperature", 0.7))
                        
                        # Get last message as active query
                        last_msg = state["messages"][-1]["content"] if state["messages"] else state["user_input"]
                        
                        add_log(state, f"Invoking LLM Model {model} with prompt length {len(prompt)} characters.")
                        response = execute_llm(model, prompt, last_msg, state["messages"][:-1], temp)
                        
                        state["messages"].append({"role": "assistant", "content": response})
                        add_log(state, f"Agent Response: {response[:150]}...")
                        
                    elif n_type == "tool":
                        # Tool Node runs selected tools
                        tool_name = n_data.get("toolName", "calculator")
                        last_msg = state["messages"][-1]["content"] if state["messages"] else state["user_input"]
                        
                        add_log(state, f"Activating Tool: {tool_name}")
                        
                        if tool_name in AVAILABLE_TOOLS:
                            tool_fn = AVAILABLE_TOOLS[tool_name]
                            # Try to extract parameters or pass query
                            if tool_name == "calculator":
                                # Extract expression like "2+2" using simple regex or use full text
                                expr_match = re_search(r"([0-9+\-*/().\s,a-zA-Z]{3,})", last_msg)
                                expr = expr_match.group(1) if expr_match else last_msg
                                tool_res = tool_fn.invoke(expr)
                            else:
                                tool_res = tool_fn.invoke(last_msg)
                            
                            add_log(state, f"Tool Result: {tool_res}")
                            state["messages"].append({"role": "system", "content": tool_res})
                        else:
                            err = f"Tool '{tool_name}' is not registered."
                            add_log(state, err)
                            state["messages"].append({"role": "system", "content": err})
                            
                    elif n_type == "router":
                        # Router Node route logic setup
                        last_msg = state["messages"][-1]["content"] if state["messages"] else ""
                        add_log(state, f"Evaluating routing rules on message: '{last_msg[:60]}'")
                        # Router node output is evaluated in conditional edge
                        
                    elif n_type == "output":
                        # Final output node
                        last_msg = state["messages"][-1]["content"] if state["messages"] else "No output produced"
                        add_log(state, f"Final output generated: {last_msg[:100]}")
                        state["variables"]["output"] = last_msg
                        
                    return state
                return node_func
            
            # Register node function in state graph
            workflow.add_node(node_id, make_node_func(node_id, node_type, node_data, node_name))
            
        # Set entry point
        workflow.set_entry_point(start_node_id)
        
        # Add edges/transitions
        for node in self.nodes_list:
            node_id = node["id"]
            node_type = node["type"]
            targets = self.adjacency.get(node_id, [])
            
            if node_type == "router":
                # Router handles conditional branches
                # Let's map target handles like 'true' or 'false'
                destinations = {}
                for target_id, handle in targets:
                    destinations[handle] = target_id
                
                # Default fallback destination is first connection or END
                fallback = targets[0][0] if targets else END
                
                def make_route_fn(dest_map, fb_dest):
                    def route_fn(state: AgentState) -> str:
                        last_msg = state["messages"][-1]["content"] if state["messages"] else ""
                        last_msg_lower = last_msg.lower()
                        
                        # Evaluate conditions
                        # E.g. if we have a connection handle matching true/false
                        # and last message contains a tool request or specific keywords.
                        add_log(state, f"Router computing decision outcome. Map: {dest_map}")
                        
                        # Custom routing logic:
                        # 1. If last message indicates we should call a tool, route to 'tool' handle
                        if "tool" in dest_map:
                            if any(x in last_msg_lower for x in ["calculator", "calculate", "search", "weather", "time"]):
                                add_log(state, f"Router routing to handle 'tool' -> {dest_map['tool']}")
                                return dest_map["tool"]
                                
                        # 2. Boolean routing: if message has error or math results
                        if "true" in dest_map or "false" in dest_map:
                            if "result:" in last_msg_lower or "utc time:" in last_msg_lower or "weather report" in last_msg_lower:
                                target = dest_map.get("true", fb_dest)
                                add_log(state, f"Router routing to handle 'true' -> {target}")
                                return target
                            else:
                                target = dest_map.get("false", fb_dest)
                                add_log(state, f"Router routing to handle 'false' -> {target}")
                                return target
                        
                        # Default routing
                        add_log(state, f"Router routing to default destination -> {fb_dest}")
                        return fb_dest
                    return route_fn
                
                # Add conditional routing edge
                workflow.add_conditional_edges(
                    node_id,
                    make_route_fn(destinations, fallback),
                    {t_id: t_id for t_id, _ in targets} | {END: END}
                )
            else:
                # Normal nodes have standard transitions
                if not targets:
                    workflow.add_edge(node_id, END)
                else:
                    # Single target transition
                    workflow.add_edge(node_id, targets[0][0])
                    
        return workflow.compile()
