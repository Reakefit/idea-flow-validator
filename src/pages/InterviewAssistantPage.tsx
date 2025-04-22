
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageSquare, Mic, MicOff, PlusCircle, Send, Lightbulb, CheckCircle, BookmarkPlus } from "lucide-react";

const InterviewAssistantPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [sentimentValue, setSentimentValue] = useState([50]);
  const [notes, setNotes] = useState("");

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <DashboardLayout>
      <div className="p-6 h-full overflow-auto">
        <div className="flex flex-col h-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Interview Assistant</h1>
            <p className="text-muted-foreground">Conduct and analyze customer interviews with AI assistance</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            {/* Left Column - Transcription */}
            <div className="lg:col-span-2 flex flex-col">
              <GlassCard className="flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Live Transcription</h2>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-muted'}`}></span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleRecording}
                      className={isRecording ? 'bg-red-500/10 text-red-500 border-red-500/30' : ''}
                    >
                      {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                  </div>
                </div>

                <div className="flex-1 bg-white/5 rounded-md p-4 overflow-y-auto mb-4 border border-white/10">
                  {transcription ? (
                    <p>{transcription}</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                      <p>Transcription will appear here when you start recording</p>
                      <p className="text-sm mt-2">Press the Start Recording button to begin</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-primary">
                    <Send className="h-4 w-4 mr-2" /> Send Summary
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <PlusCircle className="h-4 w-4 mr-2" /> New Interview
                  </Button>
                </div>
              </GlassCard>
            </div>

            {/* Right Column - Assistant & Notes */}
            <div className="flex flex-col gap-6">
              {/* AI Assistant */}
              <GlassCard>
                <h2 className="text-xl font-semibold mb-4">AI Coach</h2>
                <Tabs defaultValue="suggestions">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                    <TabsTrigger value="prompts">Question Prompts</TabsTrigger>
                  </TabsList>
                  <TabsContent value="suggestions" className="space-y-4">
                    <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
                      <div className="flex gap-2 items-start">
                        <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Ask about specific examples</p>
                          <p className="text-xs text-muted-foreground">Get concrete stories rather than general opinions</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-md p-3">
                      <div className="flex gap-2 items-start">
                        <Lightbulb className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Probe deeper on pain points</p>
                          <p className="text-xs text-muted-foreground">Ask "why" 5 times to get to the root cause</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-md p-3">
                      <div className="flex gap-2 items-start">
                        <Lightbulb className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Discuss current solutions</p>
                          <p className="text-xs text-muted-foreground">Understand what they're using now to solve this problem</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="prompts" className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-md p-3">
                      <p className="text-sm">"Can you walk me through the last time you encountered this problem?"</p>
                      <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" /> Use
                      </Button>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-md p-3">
                      <p className="text-sm">"What solutions have you tried before and why didn't they work?"</p>
                      <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" /> Use
                      </Button>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-md p-3">
                      <p className="text-sm">"How much time/money do you spend dealing with this issue?"</p>
                      <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" /> Use
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </GlassCard>

              {/* Sentiment Analysis */}
              <GlassCard>
                <h2 className="text-lg font-semibold mb-3">Live Sentiment</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Negative</span>
                    <span>Positive</span>
                  </div>
                  <Slider
                    value={sentimentValue}
                    onValueChange={setSentimentValue}
                    max={100}
                    step={1}
                    className="mb-2"
                  />
                  <div className="p-2 bg-white/5 rounded border border-white/10 text-sm">
                    <p className="text-center">
                      {sentimentValue[0] < 30 ? 'Negative sentiment detected' : 
                       sentimentValue[0] < 60 ? 'Neutral response' : 
                       'Positive engagement'}
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Notes */}
              <GlassCard className="flex-1">
                <h2 className="text-lg font-semibold mb-3">Quick Notes</h2>
                <Textarea 
                  placeholder="Add your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px] bg-white/5 border-white/10"
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm" variant="outline">
                    <BookmarkPlus className="h-4 w-4 mr-2" /> Save Note
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewAssistantPage;
