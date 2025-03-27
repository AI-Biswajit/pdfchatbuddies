
import { SuggestionPrompt, PdfSummary } from "@/types";

export const generateMockSummary = (fileName: string): PdfSummary => {
  return {
    text: `This playbook dives into the impact of agentic AI and generative AI (GenAI) on organizations, especially in the context of the Middle East. The report highlights that 73% of CEOs believe GenAI will transform how their companies operate within three years. GenAI has the potential to inject between 2.6 trillion and 4.4 trillion into global GDP by 2030. It emphasizes the importance of multi-agent AI frameworks for accelerating automation and decision-making across various industries.`,
    suggestions: [
      {
        id: '1',
        text: 'Summarize this playbook'
      },
      {
        id: '2',
        text: 'What are the key benefits of implementing GenAI in businesses?'
      },
      {
        id: '3',
        text: 'How might GenAI investments impact specific sectors like energy?'
      }
    ]
  };
};

export const getAiResponse = (question: string): string => {
  const responses: Record<string, string> = {
    'summarize this playbook': 
      `This executive playbook provides a comprehensive overview of how agentic AI and GenAI are transforming business operations globally. It covers strategic implementation considerations, potential economic impacts, and industry-specific applications with particular focus on Middle Eastern markets. The document outlines a framework for organizations to assess their AI readiness and develop a roadmap for GenAI adoption, emphasizing the need for ethical guidelines and proper governance. Overall, it serves as a strategic guide for executives looking to harness GenAI's transformative potential.`,
    
    'what are the key benefits of implementing genai in businesses': 
      `Implementing GenAI in businesses offers several key benefits:
      
1. Operational Efficiency: Automation of routine tasks and processes, reducing manual workload by up to 40%.
      
2. Enhanced Decision-Making: Data-driven insights that help executives make more informed strategic decisions.
      
3. Innovation Acceleration: Faster ideation and prototyping of new products and services.
      
4. Cost Reduction: Streamlined processes and reduced resource requirements, potentially lowering operational costs by 20-30%.
      
5. Competitive Advantage: Early adopters gain market differentiation through improved customer experiences and novel offerings.
      
6. Scalability: Ability to handle increasing workloads without proportional increase in resources.
      
7. Knowledge Management: Better capture and utilization of institutional knowledge.`,
    
    'how might genai investments impact specific sectors like energy': 
      `GenAI investments will significantly transform the energy sector in several ways:
      
1. Predictive Maintenance: AI systems can predict equipment failures before they occur, reducing downtime and maintenance costs by up to 30%.
      
2. Grid Optimization: Smart management of energy distribution, potentially improving efficiency by 15-20%.
      
3. Exploration Enhancement: In oil and gas, GenAI can analyze geological data to identify promising drilling locations with greater accuracy.
      
4. Renewable Integration: Better forecasting of renewable energy production and demand, enabling smoother integration of variable sources like solar and wind.
      
5. Trading Optimization: AI-powered market analysis for more strategic energy trading.
      
6. Customer Consumption Patterns: Detailed analysis of usage patterns to offer personalized tariffs and encourage energy efficiency.
      
7. Regulatory Compliance: Automated monitoring and reporting for environmental regulations.
      
The playbook estimates that GenAI could add $500 billion of value to the energy sector globally by 2030.`
  };

  // Convert to lowercase and remove punctuation for matching
  const normalizedQuestion = question.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Find closest match
  let bestMatch = '';
  let bestMatchScore = 0;
  
  Object.keys(responses).forEach(key => {
    const words = key.split(' ');
    let score = 0;
    
    words.forEach(word => {
      if (normalizedQuestion.includes(word)) score++;
    });
    
    if (score > bestMatchScore) {
      bestMatchScore = score;
      bestMatch = key;
    }
  });
  
  // Return matched response or default response
  return bestMatchScore > 0 
    ? responses[bestMatch]
    : "I don't have specific information about that in this document. Would you like me to help you with something else about agentic AI or GenAI?";
};
