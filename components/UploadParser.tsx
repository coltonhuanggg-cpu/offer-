import React, { useState, useRef } from 'react';
import { parseOfferFile } from '../services/geminiService';
import { processParsedOffer } from '../services/storageService';
import { ParsedOfferData } from '../types';

interface UploadParserProps {
  onSuccess: () => void;
}

const UploadParser: React.FC<UploadParserProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedOfferData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setParsedData(null);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const data = await parseOfferFile(file);
      setParsedData(data);
    } catch (err: any) {
      setError(err.message || '文件解析失败。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (!parsedData) return;
    try {
      const result = processParsedOffer(parsedData);
      if (result.success) {
        alert(result.message);
        // Reset
        setFile(null);
        setParsedData(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onSuccess();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('保存到数据库时出错。');
    }
  };

  // Helper to display offer type in Chinese
  const getOfferTypeDisplay = (type: string | null) => {
    if (!type) return '未知';
    if (type === 'Conditional') return '有条件录取 (Conditional)';
    if (type === 'Unconditional') return '无条件录取 (Unconditional)';
    if (type === 'Reject') return '拒信 (Reject)';
    if (type === 'Waitlist') return '候补 (Waitlist)';
    return type;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upload Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-cloud-upload-alt text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">上传录取通知书 (Offer)</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          支持 PDF 或图片格式 (JPG, PNG)。系统将自动提取学生姓名、录取条件、押金截止日期等关键信息。
        </p>

        <div className="flex flex-col items-center gap-4">
          <input
            type="file"
            accept=".pdf, .jpg, .jpeg, .png"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2.5 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100 cursor-pointer max-w-xs
            "
          />
          
          {file && !parsedData && (
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className={`mt-4 px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-md ${
                isProcessing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
              }`}
            >
              {isProcessing ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> 正在 AI 智能解析中...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i> 开始解析文档
                </>
              )}
            </button>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
        </div>
      </div>

      {/* Review Section */}
      {parsedData && (
        <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden animate-fade-in-up">
          <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
            <h3 className="text-white font-bold text-lg">
              <i className="fas fa-check-circle mr-2"></i> 解析结果确认
            </h3>
            <span className="text-indigo-200 text-sm">请在保存前核对信息</span>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Field label="学生姓名" value={parsedData.studentName} />
              <Field label="申请大学" value={parsedData.university} />
              <Field label="专业项目" value={parsedData.program} />
              <Field label="Offer 日期" value={parsedData.offerDate} />
              <Field label="学校 ID" value={parsedData.schoolId} />
            </div>

            <div className="space-y-4">
              <Field 
                label="Offer 类型" 
                value={getOfferTypeDisplay(parsedData.offerType)} 
                highlight={
                  parsedData.offerType === 'Unconditional' ? 'text-green-600' :
                  parsedData.offerType === 'Conditional' ? 'text-amber-600' : 'text-slate-800'
                }
              />
              <Field label="押金金额" value={parsedData.depositAmount} />
              <Field 
                label="押金截止日期" 
                value={parsedData.depositDeadline} 
                highlight={parsedData.depositDeadline ? 'text-red-500 font-bold' : ''}
              />
              <Field label="入学学期" value={parsedData.startTerm} />
            </div>

            {/* Complex Fields */}
            <div className="col-span-1 md:col-span-2 space-y-4 border-t border-slate-100 pt-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">录取条件 (Conditions)</span>
                {parsedData.conditions && parsedData.conditions.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-slate-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    {parsedData.conditions.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                ) : (
                  <span className="text-sm text-slate-400 italic">未检测到特定条件。</span>
                )}
              </div>

               <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">下一步 (Next Steps)</span>
                 {parsedData.nextSteps && parsedData.nextSteps.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-slate-700">
                    {parsedData.nextSteps.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                ) : (
                  <span className="text-sm text-slate-400 italic">无。</span>
                )}
              </div>
              
              <div className="text-xs text-slate-400 mt-2">
                <strong>原文摘录（用于核对）:</strong> "{parsedData.keySentences}"
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
             <button 
              onClick={() => { setParsedData(null); setFile(null); }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium"
            >
              放弃
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-md flex items-center gap-2"
            >
              <i className="fas fa-save"></i> 保存并录入系统
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; value: string | null; highlight?: string }> = ({ label, value, highlight }) => (
  <div className="flex flex-col">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
    <span className={`text-sm font-medium ${highlight || 'text-slate-800'} ${!value && 'text-slate-300 italic'}`}>
      {value || '未找到'}
    </span>
  </div>
);

export default UploadParser;