// src/App.jsx
import React, { useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import PccesCorrectionRow from './components/PccesCorrectionRow';
import axios from 'axios';
import { apiDomain } from './config';

export default function App() {
  const [pccesItems, setPccesItems] = useState([]);          // 上传前为空列表
  const [chapters, setChapters] = useState([]);              // 所有章码
  const [filters, setFilters] = useState({ chapter: '', keyword: '' });
  const [uploaded, setUploaded] = useState(false);           // 是否已上传
  const [fileName, setFileName] = useState('');              // 上传的文件名

  // 分頁相關 state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 处理 Excel 上传
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setUploaded(true);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const header = rows[0];
    const idxName = header.indexOf('工項名稱');
    const idxCode = header.indexOf('工項代碼');
    if (idxName < 0 || idxCode < 0) {
      alert('Excel 必須包含「工項名稱」和「工項代碼」兩欄');
      return;
    }

    const newItems = rows.slice(1).map((row, i) => ({
      id: `item-${i+1}`,
      originalDescription: String(row[idxName] ?? ''),
      originalCode:      String(row[idxCode] ?? ''),
      correctedCode: '',
      correctedDescription: '',
      selectedStage1: '',
      selectedStage2: '',
      suffixSelections: [],
      suffixDigits: ['','','','',''],
      unitCode: '',
      unitName: '',
      finalCode: '',
      finalName: '',
      showAdvanced: false,
      hasSuggested: false,
    }));
    setPccesItems(newItems);
    setCurrentPage(1);
  };

  const handleReupload = () => {
    // 清空状态，重新选择文件
    setPccesItems([]);
    setUploaded(false);
    setFileName('');
    setCurrentPage(1);
  };

  const handleUpdateItem = useCallback((itemId, updatedProps) => {
    setPccesItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, ...updatedProps } : item)
    );
  }, []);

  useEffect(() => {
    axios.get(apiDomain + '/chapters')
      .then(res => setChapters(res.data))
      .catch(err => console.error("拿章码列表出错", err));
  }, []);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const applyFilters = items =>
    items.filter(item => {
      const matchChapter = !filters.chapter || item.originalCode.startsWith(filters.chapter);
      const keyword = filters.keyword.toLowerCase();
      const matchKeyword =
        !filters.keyword ||
        item.originalCode.toLowerCase().includes(keyword) ||
        item.originalDescription.toLowerCase().includes(keyword);
      return matchChapter && matchKeyword;
    });

  const filtered = applyFilters(pccesItems);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 下載 Excel
  const handleDownload = () => {
    const data = pccesItems.map(item => ({
      原始編碼: item.originalCode,
      原始描述: item.originalDescription,
      finalCode: item.finalCode,
      finalName: item.finalName,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '結果');
    XLSX.writeFile(wb, 'pcces_corrections.xlsx');
  };

  return (
    <div>
      <h1>PCCES 編碼批次校正工具 (v5)</h1>

      {/* 匯入 / 重新上傳 */}
      <div className="data-import-placeholder" style={{ textAlign: 'center', cursor: 'pointer' }}>
        {uploaded ? (
          <>
            <p>已上傳：<strong>{fileName}</strong></p>
            <button onClick={handleReupload}>重新上傳</button>
          </>
        ) : (
          <>
            <p>尚未上傳資料</p>
            <label style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              上傳資料
            </label>
          </>
        )}
      </div>

      {/* 篩選列 */}
      <div className="control-filter-bar">
        <div className="summary-section">
          <p>總共 <span>{pccesItems.length}</span> 筆資料。</p>
          {pccesItems.length > 0 && (
            <button onClick={handleDownload} style={{ marginLeft: '1rem' }}>
              下載 Excel
            </button>
          )}
        </div>
        <div className="filter-section">
          <form id="filter-form">
            <div className="filter-group">
              <label>章碼:</label>
              <input
                type="text"
                name="chapter"
                placeholder="輸入前五碼"
                size="10"
                value={filters.chapter}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>關鍵字:</label>
              <input
                type="text"
                name="keyword"
                placeholder="搜尋描述或編碼"
                value={filters.keyword}
                onChange={handleFilterChange}
              />
            </div>
          </form>
        </div>
      </div>

      {/* 主表格 */}
      <table className="pcces-batch-correction-table">
        <thead>
          <tr>
            <th style={{width:'15%'}}>原始編碼</th>
            <th style={{width:'25%'}}>原始描述</th>
            <th style={{width:'40%'}}>系統建議 / 訂正操作</th>
            <th style={{width:'20%'}}>最終訂正編碼</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map(item => (
            <PccesCorrectionRow
              key={item.id}
              item={item}
              chapters={chapters}
              onUpdateItem={handleUpdateItem}
            />
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="4" style={{textAlign:'center'}}>
                {uploaded ? '沒有符合篩選條件的資料。' : '請先上傳 Excel 以顯示資料。'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 分頁控制 */}
      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            上一頁
          </button>
          <span style={{ margin: '0 1rem' }}>
            第 {currentPage} 頁 / 共 {totalPages} 頁
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
}
