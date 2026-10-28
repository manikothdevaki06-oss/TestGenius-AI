import React, { useState } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import { TestCase, TestCategory, TestPriority, TestStatus } from '../types';

interface EditTestCaseModalProps {
  testCase: TestCase | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: TestCase) => void;
}

export const EditTestCaseModal: React.FC<EditTestCaseModalProps> = ({
  testCase,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !testCase) return null;

  const [title, setTitle] = useState(testCase.title);
  const [objective, setObjective] = useState(testCase.objective);
  const [category, setCategory] = useState<TestCategory>(testCase.category);
  const [priority, setPriority] = useState<TestPriority>(testCase.priority);
  const [status, setStatus] = useState<TestStatus>(testCase.status);
  const [preconditionsText, setPreconditionsText] = useState(
    testCase.preconditions.join('\n')
  );
  const [stepsText, setStepsText] = useState(testCase.steps.join('\n'));
  const [testData, setTestData] = useState(testCase.testData);
  const [expectedResult, setExpectedResult] = useState(testCase.expectedResult);
  const [executionNotes, setExecutionNotes] = useState(
    testCase.executionNotes || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const preconditions = preconditionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const steps = stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      ...testCase,
      title: title.trim(),
      objective: objective.trim(),
      category,
      priority,
      status,
      preconditions,
      steps: steps.length > 0 ? steps : ['Execute scenario step'],
      testData: testData.trim(),
      expectedResult: expectedResult.trim(),
      executionNotes: executionNotes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-sm text-slate-100">
              Edit Test Case ({testCase.id})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category, Priority, Status */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TestCategory)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-slate-200"
              >
                <option value="Functional">Functional</option>
                <option value="Validation">Validation</option>
                <option value="Negative">Negative</option>
                <option value="Boundary">Boundary</option>
                <option value="Accessibility">Accessibility</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TestPriority)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-slate-200"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Execution Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TestStatus)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-slate-200 font-semibold"
              >
                <option value="Not Run">Not Run</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
                <option value="Blocked">Blocked</option>
                <option value="Skipped">Skipped</option>
              </select>
            </div>
          </div>

          {/* Objective */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Objective
            </label>
            <textarea
              rows={2}
              required
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Preconditions */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Preconditions (one per line)
            </label>
            <textarea
              rows={2}
              value={preconditionsText}
              onChange={(e) => setPreconditionsText(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 font-mono text-[11px]"
            />
          </div>

          {/* Steps */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Test Steps (one per line)
            </label>
            <textarea
              rows={4}
              required
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 font-mono text-[11px]"
            />
          </div>

          {/* Test Data */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Test Data Values
            </label>
            <input
              type="text"
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 font-mono text-[11px]"
            />
          </div>

          {/* Expected Result */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Expected Result
            </label>
            <textarea
              rows={2}
              required
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 text-emerald-300 font-medium"
            />
          </div>

          {/* Execution Notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Execution / Tester Notes (Optional)
            </label>
            <input
              type="text"
              value={executionNotes}
              onChange={(e) => setExecutionNotes(e.target.value)}
              placeholder="e.g. Tested on Staging v1.2, verified by Alex"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-300"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
