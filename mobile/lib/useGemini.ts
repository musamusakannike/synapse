import { useState } from 'react';
import { Client, Functions } from 'appwrite';

// Initialize the Appwrite client
const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68cc345f0012792efe03');

const functions = new Functions(client);

const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchGeminiReply = async (prompt: string) => {
    setLoading(true);
    setError(null);
    setReply(null);

    try {
      const execution = await functions.createExecution(
        '68cd5de0002ef3af093b',
        JSON.stringify({ prompt }),
        false,
      );
      console.log("Execution: ", JSON.stringify(execution, null, 2));

      // Parse the response
      if (execution.responseBody) {
        const result = JSON.parse(execution.responseBody);

        if (result.success) {
          setReply(result.data);
        } else {
          setError(result.error);
        }
      } else {
        setError("No response from function");
      }
    } catch (err: any) {
      console.error('Failed to fetch Gemini reply:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, reply, error, fetchGeminiReply, setReply };
};

export default useGemini;
