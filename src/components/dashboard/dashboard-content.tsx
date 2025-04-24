import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useProject } from '@/lib/context/ProjectContext';
import { useAnalysis } from '@/lib/context/AnalysisContext';
import { supabase } from '@/lib/supabase/client';

const renderValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-4 space-y-1">
        {value.map((item, index) => (
          <li key={index} className="text-sm">
            {renderValue(item)}
          </li>
        ))}
      </ul>
    );
  }
  
  if (typeof value === 'object') {
    return (
      <div className="space-y-2 pl-4 border-l">
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="space-y-1">
            <h4 className="font-medium text-sm text-muted-foreground">{key}</h4>
            <div className="pl-2">{renderValue(val)}</div>
          </div>
        ))}
      </div>
    );
  }
  
  return String(value);
};

const AnalysisCard: React.FC<{
  title: string;
  data: any;
  isLoading: boolean;
}> = ({ title, data, isLoading }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">{key}</h3>
                {renderValue(value)}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </CardContent>
    </Card>
  );
};

export const DashboardContent: React.FC = () => {
  const { currentProject } = useProject();
  const { isLoading, runAnalysis } = useAnalysis();
  const [contexts, setContexts] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    const loadContexts = async () => {
      if (!currentProject?.id) return;

      const contextTypes = [
        'market_research',
        'competitor_analysis',
        'feature_analysis',
        'customer_insights',
        'customer_persona',
        'opportunity_mapping'
      ];

      const results = await Promise.all(
        contextTypes.map(async type => {
          const tableName = type === 'customer_persona' ? 'customer_persona_context' : `${type}_context`;
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('project_id', currentProject.id)
            .single();

          if (error) return null;
          return data;
        })
      );

      const newContexts = contextTypes.reduce((acc, type, index) => {
        acc[type] = results[index];
        return acc;
      }, {} as Record<string, any>);

      setContexts(newContexts);
    };

    loadContexts();
  }, [currentProject?.id]);

  if (!currentProject) {
    return <div>No project selected</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analysis Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {currentProject.current_phase === 'analysis_complete' 
              ? 'Analysis complete. Results are shown below.'
              : 'Run analysis to generate insights.'}
          </p>
        </div>
        <Button 
          onClick={runAnalysis} 
          disabled={isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Analysis...
            </>
          ) : (
            'Run Analysis'
          )}
        </Button>
      </div>

      {isLoading && (
        <Alert className="bg-muted">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis in Progress</AlertTitle>
          <AlertDescription>
            This may take up to 5 minutes. Please be patient while we analyze your project.
            The page will refresh automatically when complete.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalysisCard
          title="Market Research"
          data={contexts.market_research}
          isLoading={isLoading}
        />
        <AnalysisCard
          title="Competitor Analysis"
          data={contexts.competitor_analysis}
          isLoading={isLoading}
        />
        <AnalysisCard
          title="Feature Analysis"
          data={contexts.feature_analysis}
          isLoading={isLoading}
        />
        <AnalysisCard
          title="Customer Insights"
          data={contexts.customer_insights}
          isLoading={isLoading}
        />
        <AnalysisCard
          title="Customer Personas"
          data={contexts.customer_persona}
          isLoading={isLoading}
        />
        <AnalysisCard
          title="Opportunity Mapping"
          data={contexts.opportunity_mapping}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
