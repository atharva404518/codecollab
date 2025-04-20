import { Request, Response } from 'express';
import { executeCode, getLanguageId } from '../services/code.service';
import { CodeExecutionRequest } from '../types';

export const executeCodeHandler = async (req: Request, res: Response) => {
  try {
    const { language, code, stdin } = req.body;

    if (!language || !code) {
      return res.status(400).json({ error: 'Language and code are required' });
    }

    const languageId = getLanguageId(language);

    const request: CodeExecutionRequest = {
      language_id: languageId,
      source_code: code,
      stdin: stdin || '',
    };

    const result = await executeCode(request);
    res.status(200).json(result);
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ error: 'Failed to execute code' });
  }
}; 

/**
 * Enhance code with better formatting
 */
export const enhanceCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    // Simple enhancement: format the code 
    // In a real implementation, this would use a code formatting library
    // or AI service to enhance the code
    const enhancedCode = code
      .split('\n')
      .map((line: string) => line.trim())
      .join('\n');
    
    res.json({ enhancedCode });
  } catch (error) {
    console.error('Error enhancing code:', error);
    res.status(500).json({ error: 'Failed to enhance code' });
  }
}; 
