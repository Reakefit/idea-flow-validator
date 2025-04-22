
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, Download, MessageSquare, ThumbsUp } from "lucide-react";

const InterviewSummaryPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6 h-full overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Interview Summary</h1>
            <p className="text-muted-foreground">Interview with John Smith - Product Manager at Acme Corp</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overview Card */}
          <div className="lg:col-span-3">
            <GlassCard>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Interview Overview</h2>
                  <p className="text-muted-foreground mb-4">30-minute discussion on April 10, 2025</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="bg-white/5">Enterprise Customer</Badge>
                    <Badge variant="outline" className="bg-white/5">Decision Maker</Badge>
                    <Badge variant="outline" className="bg-primary/20 text-primary">High Value</Badge>
                  </div>
                </div>
                <div className="shrink-0 flex items-center justify-center bg-primary/10 rounded-lg p-4 md:p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-1">82%</div>
                    <div className="text-sm text-muted-foreground">Interest Score</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Top Pain Points */}
          <GlassCard className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Top 3 Pain Points</h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-500/20 rounded-full p-2 text-red-400 mt-1">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Data Integration Complexity</h3>
                    <p className="text-muted-foreground text-sm">
                      "Connecting our various data sources takes too much developer time, and the integrations break constantly."
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-500/20 rounded-full p-2 text-amber-400 mt-1">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Reporting Limitations</h3>
                    <p className="text-muted-foreground text-sm">
                      "Creating custom reports is too technical for our team, requiring us to involve IT for every new dashboard."
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 rounded-full p-2 text-blue-400 mt-1">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">User Permission Management</h3>
                    <p className="text-muted-foreground text-sm">
                      "Managing access controls for different departments is overly complex and constantly causes friction."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Memorable Quotes */}
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4">Memorable Quotes</h2>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-md p-4 relative">
                <MessageSquare className="h-6 w-6 absolute -top-3 -left-3 text-primary bg-background p-1 rounded-full" />
                <p className="italic text-sm">"We've tried three different solutions in the past year, and none of them could handle our scale without breaking."</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-md p-4 relative">
                <MessageSquare className="h-6 w-6 absolute -top-3 -left-3 text-primary bg-background p-1 rounded-full" />
                <p className="italic text-sm">"If you could solve this one problem, I'd sign a contract tomorrow. It's that critical to our operations."</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-md p-4 relative">
                <MessageSquare className="h-6 w-6 absolute -top-3 -left-3 text-primary bg-background p-1 rounded-full" />
                <p className="italic text-sm">"Our team spends at least 15 hours a week just managing the workarounds for our current system."</p>
              </div>
            </div>
          </GlassCard>

          {/* Follow Up */}
          <GlassCard className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Follow-up Suggestions</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-md">
                <ThumbsUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Share API documentation</p>
                  <p className="text-sm text-muted-foreground">John mentioned interest in our API capabilities for custom integrations</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-md">
                <ThumbsUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Schedule technical demo</p>
                  <p className="text-sm text-muted-foreground">Include their IT team in the next discussion to address security concerns</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-md">
                <ThumbsUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Prepare custom ROI calculation</p>
                  <p className="text-sm text-muted-foreground">Based on the 15 hours per week they currently spend on workarounds</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Action Items */}
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4">Action Items</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5">
                <div className="h-5 w-5 rounded border border-primary/50 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span>Send case study on enterprise implementation</span>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5">
                <div className="h-5 w-5 rounded border border-white/20 flex items-center justify-center">
                </div>
                <span>Follow up about budget timeline</span>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5">
                <div className="h-5 w-5 rounded border border-white/20 flex items-center justify-center">
                </div>
                <span>Schedule demo with technical team</span>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5">
                <div className="h-5 w-5 rounded border border-white/20 flex items-center justify-center">
                </div>
                <span>Create custom pricing proposal</span>
              </div>
              
              <Separator className="my-3" />
              
              <Button className="w-full">Add New Action Item</Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewSummaryPage;
