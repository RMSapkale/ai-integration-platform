"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
import { Send, Bot, User, Loader2, Sparkles, Zap, Maximize2, Trash2, Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FlowViewer } from "@/components/FlowViewer";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Message {
    role: "user" | "assistant";
    content: string;
    flowData?: any;
}

export function ChatInterface() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedFlow, setExpandedFlow] = useState<any | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [latestFlow, setLatestFlow] = useState<any | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Fetch chat history on mount
        const fetchHistory = async () => {
            try {
                // Check for flowId in URL
                const params = new URLSearchParams(window.location.search);
                const flowId = params.get("flowId");

                if (flowId) {
                    // Load specific flow for editing
                    const res = await api.get(`/flows/${flowId}`);
                    if (res.data.status === "success") {
                        const flow = res.data.flow;
                        setLatestFlow(flow);
                        setMessages([
                            {
                                role: "assistant",
                                content: `I've loaded the flow **"${flow.name}"**. How would you like to modify it?`,
                                flowData: flow
                            }
                        ]);
                        // Clear URL param without reload
                        window.history.replaceState({}, document.title, "/dashboard");
                        return;
                    }
                }

                // Otherwise load history
                const res = await api.get("/chat/history");
                if (res.data && res.data.length > 0) {
                    setMessages(res.data);
                    // Set latest flow from history if available
                    const lastFlowMsg = [...res.data].reverse().find(m => m.flowData);
                    if (lastFlowMsg) {
                        setLatestFlow(lastFlowMsg.flowData);
                    }
                } else {
                    setMessages([
                        { role: "assistant", content: "Hello! I'm your Integration Architect. Describe the integration you want to build." }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch chat history or flow", error);
                setMessages([
                    { role: "assistant", content: "Hello! I'm your Integration Architect. Describe the integration you want to build." }
                ]);
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const saveMessage = async (msg: Message) => {
        try {
            await api.post("/chat/message", msg);
        } catch (error) {
            console.error("Failed to save message", error);
        }
    };

    const clearChat = async () => {
        if (!confirm("Are you sure you want to clear the chat history?")) {
            return;
        }

        try {
            await api.delete("/chat/history");
            setMessages([
                { role: "assistant", content: "Chat history cleared. How can I help you?" }
            ]);
            setLatestFlow(null); // Clear flow context
            setInput(""); // Clear input
        } catch (error) {
            console.error("Failed to clear chat", error);
            // Still clear locally even if API fails
            setMessages([
                { role: "assistant", content: "Chat history cleared locally. How can I help you?" }
            ]);
            setLatestFlow(null);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['.docx', '.pdf'];
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (!validTypes.includes(fileExtension)) {
                alert('Please upload a .docx or .pdf file');
                return;
            }
            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const sendDocument = async () => {
        if (!selectedFile) return;

        const userMsg: Message = { role: "user", content: `📄 Uploaded: ${selectedFile.name}` };
        setMessages((prev) => [...prev, userMsg]);
        saveMessage(userMsg);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            if (latestFlow) {
                formData.append('current_flow', JSON.stringify(latestFlow));
            }

            const res = await api.post("/upload-document", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const job = res.data.job;
            setLatestFlow(job);

            let content = `I've analyzed your business requirements document and generated a flow.\n\n**Name**: ${job.name}`;

            if (job.trigger) {
                content += `\n**Trigger**: ${job.trigger.adapter_id}`;
            }

            if (job.steps && Array.isArray(job.steps)) {
                content += `\n**Steps**: ${job.steps.map((s: any) => s.adapter_id).join(" → ")}`;
            }

            if (res.data.extracted_text) {
                content += `\n\n*Extracted from document: "${res.data.extracted_text.substring(0, 100)}..."*`;
            }

            const assistantMsg: Message = {
                role: "assistant",
                content: content,
                flowData: job
            };
            setMessages((prev) => [...prev, assistantMsg]);
            saveMessage(assistantMsg);

            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error(error);
            const errorMsg: Message = { role: "assistant", content: "Sorry, I encountered an error processing your document." };
            setMessages((prev) => [...prev, errorMsg]);
            saveMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        if (input.trim().toLowerCase() === "clear") {
            await clearChat();
            setInput("");
            return;
        }

        const userMsg: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        saveMessage(userMsg); // Save user message
        setInput("");
        setLoading(true);

        try {
            const res = await api.post("/analyze", {
                prompt: input,
                current_flow: latestFlow // Send current flow context
            });

            // Check if it's a conversational response
            if (res.data.status === "conversation") {
                const assistantMsg: Message = {
                    role: "assistant",
                    content: res.data.message
                };
                setMessages((prev) => [...prev, assistantMsg]);
                saveMessage(assistantMsg);
                setLoading(false);
                return;
            }

            // It's a flow response
            const job = res.data.job;
            setLatestFlow(job); // Update latest flow context

            // Construct message content based on new model (Trigger + Steps)
            let content = `I've generated a flow for you based on your request.\n\n**Name**: ${job.name}`;

            if (job.trigger) {
                content += `\n**Trigger**: ${job.trigger.adapter_id}`;
            }

            if (job.steps && Array.isArray(job.steps)) {
                content += `\n**Steps**: ${job.steps.map((s: any) => s.adapter_id).join(" → ")}`;
            } else if (job.source && job.destination) {
                // Fallback
                content += `\n**Source**: ${job.source.adapter_id}\n**Destination**: ${job.destination.adapter_id}`;
            }

            content += `\n\nJob ID: ${job.id}`;

            const assistantMsg: Message = {
                role: "assistant",
                content: content,
                flowData: job
            };
            setMessages((prev) => [...prev, assistantMsg]);
            saveMessage(assistantMsg); // Save assistant message
        } catch (error) {
            console.error(error);
            const errorMsg: Message = { role: "assistant", content: "Sorry, I encountered an error communicating with the Control Plane." };
            setMessages((prev) => [...prev, errorMsg]);
            saveMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const [showConnectionDialog, setShowConnectionDialog] = useState(false);
    const [pendingFlow, setPendingFlow] = useState<any>(null);
    const [existingConnections, setExistingConnections] = useState<any[]>([]);
    const [selectedConnections, setSelectedConnections] = useState<Record<string, string>>({});

    const handleCreateFlow = async (flowData: any) => {
        // First, fetch existing connections for adapters in this flow
        try {
            const response = await api.get("/connections");
            const connections = response.data.connections || [];

            // Get unique adapters from flow
            const adapters = new Set<string>();
            if (flowData.trigger?.adapter_id) {
                adapters.add(flowData.trigger.adapter_id);
            }
            flowData.steps?.forEach((step: any) => {
                if (step.adapter_id) {
                    adapters.add(step.adapter_id);
                }
            });

            // Filter connections for these adapters
            const relevantConnections = connections.filter((conn: any) =>
                adapters.has(conn.adapter_id)
            );

            if (relevantConnections.length > 0) {
                // Show dialog to select connections
                setExistingConnections(relevantConnections);
                setPendingFlow(flowData);
                setShowConnectionDialog(true);
            } else {
                // No existing connections, create flow directly
                await createFlowWithConnections(flowData, {});
            }
        } catch (error) {
            console.error("Error fetching connections:", error);
            // Fallback: create flow without connection selection
            await createFlowWithConnections(flowData, {});
        }
    };

    const createFlowWithConnections = async (flowData: any, connectionMap: Record<string, string>) => {
        try {
            // Attach selected connections to flow
            const flowWithConnections = {
                ...flowData,
                connection_mappings: connectionMap
            };

            await api.post("/flows", flowWithConnections);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `✅ Flow "${flowData.name}" created successfully! It has been added to your Active Flows.` },
            ]);
            setExpandedFlow(null);
            setShowConnectionDialog(false);
            setPendingFlow(null);
            setSelectedConnections({});
        } catch (error) {
            console.error("Failed to create flow", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "❌ Failed to create flow. Please try again." },
            ]);
        }
    };

    const handleConnectionDialogSubmit = () => {
        if (pendingFlow) {
            createFlowWithConnections(pendingFlow, selectedConnections);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-50/50 relative">
            {/* Header with Clear Button */}
            <div className="absolute top-0 right-0 p-4 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearChat}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                    title="Clear Chat"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 pb-24 scroll-smooth"
            >
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "flex w-full gap-3",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm mt-1 shrink-0">
                                    <Bot size={16} />
                                </div>
                            )}

                            <div
                                className={cn(
                                    "flex flex-col max-w-[85%] rounded-2xl p-4 text-sm shadow-sm",
                                    msg.role === "user"
                                        ? "bg-slate-900 text-white rounded-tr-sm"
                                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm"
                                )}
                            >
                                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                                {msg.flowData && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mt-4 w-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                                    >
                                        <div className="bg-white border-b border-slate-100 p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-cyan-100 text-cyan-600 rounded-md">
                                                    <Sparkles size={14} />
                                                </div>
                                                <span className="font-medium text-slate-900 text-xs uppercase tracking-wide">Generated Flow Preview</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-slate-400 hover:text-slate-600"
                                                onClick={() => setExpandedFlow(msg.flowData)}
                                            >
                                                <Maximize2 size={14} />
                                            </Button>
                                        </div>

                                        <div className="h-[300px] bg-slate-50/50 relative">
                                            <FlowViewer flowData={msg.flowData} />
                                        </div>

                                        <div className="p-3 bg-white border-t border-slate-100">
                                            <Button
                                                onClick={() => handleCreateFlow(msg.flowData)}
                                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md shadow-emerald-500/20"
                                                size="sm"
                                            >
                                                <Zap className="mr-2 h-4 w-4" />
                                                Create Flow & Connections
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {msg.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mt-1 shrink-0">
                                    <User size={16} />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 shadow-sm">
                            <Loader2 size={16} className="animate-spin text-cyan-500" />
                            <span className="text-slate-500 text-sm">Designing your integration...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Connection Selection Dialog */}
            {showConnectionDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-2">Select Connections</h2>
                            <p className="text-slate-600 mb-6">
                                We found existing connections for this flow. Would you like to reuse them?
                            </p>

                            <div className="space-y-4">
                                {Array.from(new Set(
                                    existingConnections.map((conn: any) => conn.adapter_id)
                                )).map((adapterId: string) => {
                                    const adapterConnections = existingConnections.filter(
                                        (conn: any) => conn.adapter_id === adapterId
                                    );

                                    return (
                                        <div key={adapterId} className="border rounded-lg p-4">
                                            <h3 className="font-semibold mb-3 capitalize">
                                                {adapterId.replace(/_/g, ' ')} Connections
                                            </h3>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`connection-${adapterId}`}
                                                        value="new"
                                                        checked={!selectedConnections[adapterId]}
                                                        onChange={() => {
                                                            const newSelections = { ...selectedConnections };
                                                            delete newSelections[adapterId];
                                                            setSelectedConnections(newSelections);
                                                        }}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="font-medium">Create New Connection</span>
                                                </label>
                                                {adapterConnections.map((conn: any) => (
                                                    <label
                                                        key={conn.id}
                                                        className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`connection-${adapterId}`}
                                                            value={conn.id}
                                                            checked={selectedConnections[adapterId] === conn.id}
                                                            onChange={() => {
                                                                setSelectedConnections({
                                                                    ...selectedConnections,
                                                                    [adapterId]: conn.id
                                                                });
                                                            }}
                                                            className="w-4 h-4"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="font-medium">{conn.name}</div>
                                                            {conn.description && (
                                                                <div className="text-sm text-slate-500">
                                                                    {conn.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            {conn.status || 'Active'}
                                                        </Badge>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowConnectionDialog(false);
                                        setPendingFlow(null);
                                        setSelectedConnections({});
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConnectionDialogSubmit}
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-500"
                                >
                                    Create Flow
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent">
                {/* File Preview */}
                {selectedFile && (
                    <div className="mb-2 flex items-center gap-2 bg-slate-100 p-2 rounded-lg border border-slate-200">
                        <FileText className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-700 flex-1">{selectedFile.name}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <div className="relative flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100">
                    <div className="pl-3 text-slate-400">
                        <Sparkles size={18} />
                    </div>

                    {/* Hidden File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".docx,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* File Upload Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="text-slate-400 hover:text-slate-600 h-10 w-10"
                        title="Upload Document"
                    >
                        <Upload size={18} />
                    </Button>

                    <Input
                        className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent text-slate-700 placeholder:text-slate-400 h-10"
                        placeholder={selectedFile ? "Click send to process document..." : "Describe your integration (e.g., 'Sync Salesforce leads to Slack')..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                if (selectedFile) {
                                    sendDocument();
                                } else {
                                    sendMessage();
                                }
                            }
                        }}
                        disabled={loading}
                    />
                    <Button
                        onClick={selectedFile ? sendDocument : sendMessage}
                        disabled={loading || (!input.trim() && !selectedFile)}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg w-10 h-10 p-0 shrink-0 transition-all"
                    >
                        <Send size={16} />
                    </Button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-slate-400 font-medium">Powered by Iwings Neural Engine v2.0 | Upload .docx or .pdf files</span>
                </div>
            </div>

            {/* Expanded Flow Dialog */}
            <Dialog open={!!expandedFlow} onOpenChange={(open) => !open && setExpandedFlow(null)}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="text-cyan-500" size={20} />
                            {expandedFlow?.name || "Flow Preview"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 bg-slate-50 relative border-y border-slate-100">
                        <FlowViewer flowData={expandedFlow} />
                    </div>
                    <div className="p-4 bg-white flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setExpandedFlow(null)}>
                            Close
                        </Button>
                        <Button
                            onClick={() => handleCreateFlow(expandedFlow)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Zap className="mr-2 h-4 w-4" />
                            Create Flow & Connections
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
