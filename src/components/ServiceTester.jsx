import React, { useState } from 'react';
import { useServiceTester } from '../hooks/useServiceTester';

// Import your actual services to test
import { roomService } from '../api/roomService';
import { authService } from '../api/auth';

export const ServiceTester = () => {
  const { testService, results, loading, clearResults } = useServiceTester();
  const [isOpen, setIsOpen] = useState(false);

  // Define tests for your actual service functions
  const serviceTests = [
    {
      name: 'Room Service - Fetch Rooms',
      description: 'Tests your roomService.fetchRooms() function',
      testKey: 'fetchRooms',
      testFunction: () => testService('fetchRooms', roomService.fetchRooms),
      category: 'Room Service'
    },
    // {
    //   name: 'Room Service - Fetch Room Details',
    //   description: 'Tests your roomService.fetchRoomDetails() function with room ID 1',
    //   testKey: 'fetchRoomDetails',
    //   testFunction: () => testService('fetchRoomDetails', roomService.fetchRoomDetails, 1),
    //   category: 'Room Service'
    // },
    {
      name: 'Room Service - Create Private Room',
      description: 'Tests your roomService.createPrivateRoom() function',
      testKey: 'createPrivateRoom',
      testFunction: () => testService('createPrivateRoom', roomService.createPrivateRoom, 1),
      category: 'Room Service',
      warning: 'Will attempt to create a private room with admin ID 1'
    },
    {
      name: 'Room Service - Delete Rooms',
      description: 'Tests your roomService.deleteRooms() function',
      testKey: 'deleteRooms',
      testFunction: () => testService('deleteRooms', roomService.deleteRooms, [2]),
      category: 'Room Service',
      warning: 'Will attempt to delete room member IDs [2]'
    },
    {
      name: 'Auth Service - Login',
      description: 'Tests your authService.loginPeserta() function',
      testKey: 'login',
      testFunction: () => testService(
        'login', 
        authService.loginPeserta, 
        'rifqi.pratama@example.com', 
        'pesertaSatu'
      ),
      category: 'Auth Service',
      warning: 'Will attempt actual login with test credentials'
    },
    {
      name: 'Auth Service - Get Current User',
      description: 'Tests your authService.getCurrentUser() function',
      testKey: 'getCurrentUser',
      testFunction: () => testService('getCurrentUser', authService.getCurrentUser),
      category: 'Auth Service'
    },
    {
      name: 'Auth Service - Is Authenticated',
      description: 'Tests your authService.isAuthenticated() function',
      testKey: 'isAuthenticated',
      testFunction: () => testService('isAuthenticated', authService.isAuthenticated),
      category: 'Auth Service'
    }
  ];

  const runTest = async (test) => {
    console.log(`Running test: ${test.testKey}`); // Debug log
    await test.testFunction();
  };

  const runAllTests = async () => {
    for (const test of serviceTests) {
      if (!test.warning || window.confirm(`${test.warning}. Continue?`)) {
        await runTest(test);
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  const groupedTests = serviceTests.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = [];
    }
    acc[test.category].push(test);
    return acc;
  }, {});

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Service Tester"
      >
        ⚙️
      </button>

      {/* Service Tester Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[500px] max-h-96 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-green-500 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">Service Code Tester</h3>
            <div className="flex gap-2">
              <button
                onClick={runAllTests}
                className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                disabled={Object.values(loading).some(Boolean)}
              >
                Run All
              </button>
              <button
                onClick={clearResults}
                className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-green-600 w-6 h-6 rounded flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>

          {/* Debug Info */}
          {/* <div className="bg-yellow-50 p-2 text-xs">
            <details>
              <summary className="cursor-pointer text-yellow-700">Debug Info</summary>
              <div className="mt-1">
                <div>Loading states: {JSON.stringify(Object.keys(loading))}</div>
                <div>Results: {JSON.stringify(Object.keys(results))}</div>
              </div>
            </details>
          </div> */}

          {/* Test Categories */}
          <div className="max-h-80 overflow-y-auto">
            {Object.entries(groupedTests).map(([category, tests]) => (
              <div key={category} className="border-b border-gray-100">
                <div className="bg-gray-50 px-3 py-2 font-medium text-sm text-gray-700">
                  {category}
                </div>
                
                {tests.map((test) => (
                  <div key={test.name} className="border-b border-gray-50 p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{test.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {test.description}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Test Key: {test.testKey}
                        </div>
                        {test.warning && (
                          <div className="text-xs text-orange-600 mt-1">
                            ⚠️ {test.warning}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => runTest(test)}
                        disabled={loading[test.testKey]}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50 ml-3"
                      >
                        {loading[test.testKey] ? 'Testing...' : 'Test'}
                      </button>
                    </div>

                    {/* Result */}
                    {results[test.testKey] && (
                      <TestResult result={results[test.testKey]} />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TestResult = ({ result }) => {
  return (
    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
      <div className={`font-medium mb-1 flex justify-between ${
        result.success ? 'text-green-600' : 'text-red-600'
      }`}>
        <span>{result.success ? '✓ Success' : '✗ Failed'}</span>
        <span className="text-gray-500">{result.executionTime}ms</span>
      </div>
      
      {/* Function Arguments */}
      {result.args && result.args.length > 0 && (
        <div className="mb-2">
          <div className="text-gray-600 font-medium">Called with:</div>
          <div className="text-gray-500 font-mono">
            ({result.args.map(arg => typeof arg === 'string' ? `"${arg}"` : JSON.stringify(arg)).join(', ')})
          </div>
        </div>
      )}
      
      {/* Success Result */}
      {result.success && result.result && (
        <div className="text-gray-600">
          <details className="cursor-pointer">
            <summary className="font-medium">Function Result</summary>
            <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </details>
        </div>
      )}
      
      {/* Error Result */}
      {!result.success && (
        <div className="text-red-600">
          <div className="font-medium">Error:</div>
          <div className="mt-1">{result.error}</div>
          {result.stack && (
            <details className="mt-1 cursor-pointer">
              <summary className="text-xs text-gray-500">Stack trace</summary>
              <pre className="mt-1 p-1 bg-white rounded text-xs overflow-auto max-h-20">
                {result.stack}
              </pre>
            </details>
          )}
        </div>
      )}
      
      <div className="text-gray-400 mt-2 text-xs">
        {new Date(result.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};