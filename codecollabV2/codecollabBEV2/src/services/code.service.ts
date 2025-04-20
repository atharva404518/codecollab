import axios from 'axios';
import { CodeExecutionRequest, CodeExecutionResponse } from '../types';

// Language to Judge0 language ID mapping
export const languageMap: Record<string, number> = {
  javascript: 63,  // JavaScript (Node.js 12.14.0)
  typescript: 74,  // TypeScript 3.7.4
  python: 71,      // Python 3.8.1
  java: 62,        // Java 13.0.1
  csharp: 51,      // C# Mono 6.6.0.161
  cpp: 54,         // C++ GCC 9.2.0
  php: 68,         // PHP 7.4.1
  ruby: 72,        // Ruby 2.7.0
  go: 60,          // Go 1.13.5
  rust: 73,        // Rust 1.40.0
  kotlin: 78,      // Kotlin 1.3.70
  swift: 83,       // Swift 5.2.3
  bash: 46,        // Bash 5.0.0
  sql: 82,         // SQLite 3.27.2
};

// Get language ID for Judge0 API
export const getLanguageId = (language: string): number => {
  const languageId = languageMap[language.toLowerCase()];
  if (!languageId) {
    // Default to JavaScript if language not supported
    console.warn(`Language ${language} not supported, defaulting to JavaScript`);
    return languageMap.javascript;
  }
  return languageId;
};

// Define response type interfaces
interface Judge0CreateResponse {
  token: string;
}

interface Judge0ResultResponse {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | number;
  memory: number;
}

// Execute code using Judge0 API
export const executeCode = async (request: CodeExecutionRequest): Promise<CodeExecutionResponse> => {
  try {
    const apiUrl = process.env.JUDGE0_API_URL;
    const apiKey = process.env.JUDGE0_API_KEY;

    if (!apiUrl || !apiKey) {
      console.error('Judge0 API not configured');
      throw new Error('Code execution service not configured');
    }

    // Encode source code and other fields
    const encodedRequest = {
      source_code: Buffer.from(request.source_code).toString('base64'),
      language_id: request.language_id,
      stdin: request.stdin ? Buffer.from(request.stdin).toString('base64') : '',
    };

    // Submit to Judge0 API
    const createResponse = await axios.post(`${apiUrl}/submissions`, encodedRequest, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': apiKey,
      },
      params: {
        base64_encoded: true,
        wait: true,  // Wait for the result
      },
    });

    // Get submission token with proper type assertion
    const createData = createResponse.data as Judge0CreateResponse;
    const token = createData.token;

    // Get submission result
    const resultResponse = await axios.get(`${apiUrl}/submissions/${token}`, {
      headers: {
        'X-RapidAPI-Key': apiKey,
      },
      params: {
        base64_encoded: true,
      },
    });

    // Add type assertion for result
    const result = resultResponse.data as Judge0ResultResponse;

    // Decode the outputs
    const output = result.stdout ? Buffer.from(result.stdout, 'base64').toString() : '';
    const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString() : '';
    const error = result.compile_output ? Buffer.from(result.compile_output, 'base64').toString() : '';

    return {
      status: {
        id: result.status.id,
        description: result.status.description,
      },
      output: output,
      stderr: stderr,
      error: error,
      time: result.time,
      memory: result.memory,
    };
  } catch (error) {
    console.error('Error executing code:', error);
    
    // Simulate execution for development or when API is not available
    console.log('Falling back to simulated execution');
    return simulateCodeExecution(request);
  }
};

// Fallback to simulated execution when API is not available
const simulateCodeExecution = (request: CodeExecutionRequest): CodeExecutionResponse => {
  const language = Object.keys(languageMap).find(
    (key) => languageMap[key] === request.language_id
  ) || 'unknown';

  return {
    status: {
      id: 0,
      description: 'Simulated Execution',
    },
    output: `[Simulated ${language} execution] Your code would execute here.\nActual execution requires the Judge0 API.`,
    stderr: '',
    error: '',
    time: 0,
    memory: 0,
  };
}; 
