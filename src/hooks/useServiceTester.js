import { useState } from "react";

export const useServiceTester = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testService = async (testName, serviceFunction, ...args) => {
    setLoading((prev) => ({ ...prev, [testName]: true }));

    const startTime = Date.now();

    try {
      const result = await serviceFunction(...args);
      const endTime = Date.now();

      const testResult = {
        success: true,
        result: result,
        executionTime: endTime - startTime,
        timestamp: new Date().toISOString(),
        args: args,
      };

      setResults((prev) => ({ ...prev, [testName]: testResult }));
      return testResult;
    } catch (error) {
      const endTime = Date.now();

      const testResult = {
        success: false,
        error: error.message,
        stack: error.stack,
        executionTime: endTime - startTime,
        timestamp: new Date().toISOString(),
        args: args,
      };

      setResults((prev) => ({ ...prev, [testName]: testResult }));
      return testResult;
    } finally {
      setLoading((prev) => ({ ...prev, [testName]: false }));
    }
  };

  const clearResults = () => setResults({});

  return {
    testService,
    results,
    loading,
    clearResults,
  };
};
