import React, { useState, useEffect, useCallback, useRef } from 'react';

// IKIGAI 問卷數據模型
const SECTIONS = [
    { id: 'intro', title: '自我價值探索問卷（IKIGAI 框架）', stepTitle: '開始準備', isIntro: true },
    { id: 'love', title: '第一圈：熱愛（LOVE）', stepTitle: '熱愛', subtitle: '目標：找出能讓你快樂、充滿熱情、廢寢忘食的事物。', questions: [
        { id: 'q1', label: '時間忘記題', helper: '回想一下，做什麼事情的時候，會讓你完全投入，甚至忘記時間的流逝？（例如：打一場精彩的籃球、畫一張圖、看一本小說、研究恐龍百科…）' },
        { id: 'q2', label: '自由時光題', helper: '如果給你一整個下午的自由時間，完全不用考慮功課或別人的要求，你最想做什麼事來讓自己開心？' },
        { id: 'q3', label: '好奇寶寶題', helper: '你對什麼樣的事情充滿好奇心？會讓你想上網查資料、看影片，或跑去問別人「為什麼」？' },
        { id: 'q4', label: '心情題', helper: '最近讓你感到愉悅的事情是什麼？' }
    ]},
    { id: 'good_at', title: '第二圈：擅長（GOOD AT）', stepTitle: '擅長', subtitle: '目標：盤點你的天賦與技能，建立自信。', questions: [
        { id: 'q5', label: '他人肯定題', helper: '同學、朋友或家人最常稱讚你什麼？他們最常在哪方面尋求你的幫助？' },
        { id: 'q6', label: '學習超車題', helper: '有沒有什麼事情，你覺得自己學起來比別人快，或不用太費力就能做得不錯？' },
        { id: 'q7', label: '成就感來源題', helper: '完成什麼樣的任務會讓你有「我做到了！」的成就感？' },
        { id: 'q8', label: '小老師題', helper: '如果要你教別人一件事，你最想教什麼？' }
    ]},
    { id: 'world_needs', title: '第三圈：世界的需求（WORLD NEEDS）', stepTitle: '需求', subtitle: '目標：觀察生活、思考社會連結，把「世界」縮小為「你周遭的世界」。', questions: [
        { id: 'q9', label: '小小抱怨題', helper: '在你的生活周遭（學校、家裡、社區），有沒有什麼讓你覺得「真不方便」或「如果能…就好了」的事情？' },
        { id: 'q10', label: '超能力英雄題', helper: '如果給你一種超能力，你最想用它來解決世界或社會上的哪個問題？' },
        { id: 'q11', label: '感謝名單題', helper: '有哪些職業的人會讓你覺得「有他們在真好」？你為什麼感謝他們？' }
    ]},
    { id: 'paid_for', title: '第四圈：價值（PAID FOR）', stepTitle: '價值', subtitle: '目標：把能力與現實世界的價值連結，但避免功利。', questions: [
        { id: 'q12', label: '小小幫手題', helper: '在你擅長的事情中，哪一項未來可能成為一項服務，會有人願意付費請你幫忙？' },
        { id: 'q13', label: '職業想像題', helper: '拋開成績與考試，單純從「好像很有趣」出發，你覺得哪些工作既酷又能讓你過上不錯的生活？' }
    ]},
    { id: 'summary', title: '總結題', stepTitle: '總結', questions: [
        { id: 'q14', label: '未來想像題', helper: '如果要用一句話描述「未來的你」，你會怎麼說？（例如：會設計遊戲的科學家、能幫助別人的老師…）' }
    ]},
    { id: 'preview', title: '預覽與下載', stepTitle: '預覽', isPreview: true }
];

const STATE_KEY = 'ikigai.answers.v1';

// 自動調整 textarea 高度
const autoResize = (element) => {
    if (element) {
        element.style.height = 'auto';
        element.style.height = (element.scrollHeight + 2) + 'px';
    }
};

// =========================================================================

export default function App() {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [answers, setAnswers] = useState(() => {
        // 初始狀態：嘗試從 localStorage 加載，否則使用預設值
        const savedData = localStorage.getItem(STATE_KEY);
        let defaultAnswers = {
            nickname: '',
            date: new Date().toISOString().substring(0, 10),
        };
        if (savedData) {
            try {
                const loaded = JSON.parse(savedData);
                delete loaded.email; // 移除舊的 email 欄位
                defaultAnswers = { ...defaultAnswers, ...loaded };
            } catch (e) {
                console.error('Failed to parse saved state:', e);
            }
        }
        return defaultAnswers;
    });

    const [error, setError] = useState('');
    const textareaRefs = useRef({});

    // 儲存草稿
    const saveDraft = useCallback((currentAnswers) => {
        try {
            localStorage.setItem(STATE_KEY, JSON.stringify(currentAnswers));
        } catch (e) {
            console.error('Failed to save draft:', e);
        }
    }, []);

    // 處理輸入變更 (包含基本資訊和問答框)
    const handleInputChange = (event) => {
        const { id, value } = event.target;

        setAnswers(prevAnswers => {
            let newAnswers = { ...prevAnswers };

            if (id === 'nickname' || id === 'date') {
                newAnswers[id] = value;
            } else if (id.startsWith('q')) {
                const [qId, indexStr] = id.split('_');
                const index = parseInt(indexStr, 10);
                
                if (!Array.isArray(newAnswers[qId])) {
                    newAnswers[qId] = [];
                }
                newAnswers[qId][index] = value;
            }
            
            saveDraft(newAnswers);
            return newAnswers;
        });

        // 對 textarea 進行即時調整
        if (event.target.tagName === 'TEXTAREA') {
            autoResize(event.target);
        }
    };
    
    // 清空草稿
    const clearDraft = () => {
        if (window.confirm('確定要清空所有已儲存的草稿並重設問卷嗎？')) {
            localStorage.removeItem(STATE_KEY);
            setAnswers({
                nickname: '',
                date: new Date().toISOString().substring(0, 10),
            });
            setError('');
            setCurrentPageIndex(0);
        }
    };

    // 新增/移除問答框
    const addAnswer = (qId) => {
        setAnswers(prevAnswers => {
            const newAnswers = { ...prevAnswers };
            if (!Array.isArray(newAnswers[qId])) {
                newAnswers[qId] = [];
            }
            newAnswers[qId].push('');
            saveDraft(newAnswers);
            return newAnswers;
        });
    };

    const removeAnswer = (qId, index) => {
        setAnswers(prevAnswers => {
            const newAnswers = { ...prevAnswers };
            const answersArray = newAnswers[qId];
            if (Array.isArray(answersArray) && answersArray.length > 1) {
                answersArray.splice(index, 1);
                saveDraft(newAnswers);
            }
            return newAnswers;
        });
    };

    // 導航邏輯
    const goToPage = (index) => {
        const targetIndex = Math.max(0, Math.min(index, SECTIONS.length - 1));

        // 僅在進入預覽頁時檢查暱稱是否為空 (用於顯示提醒，不阻擋導航)
        if (SECTIONS[targetIndex].isPreview) {
            if (!answers.nickname || answers.nickname.trim() === '') {
                setError(`暱稱欄位為空，檔案將預設命名為 "ikigai_${answers.date.replace(/-/g, '')}_student.txt/json"。`);
            } else {
                setError('');
            }
        } else {
            setError('');
        }
        setCurrentPageIndex(targetIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 自動調整所有 textarea 高度
    useEffect(() => {
        // 在組件渲染後，確保所有已掛載的 textarea 都調整大小
        const elements = Object.values(textareaRefs.current).filter(el => el);
        elements.forEach(autoResize);
    }, [answers, currentPageIndex]);

    // ====================== 下載功能 ======================

    const generateTxtContent = () => {
        const d = answers;
        const now = new Date();
        const timestamp = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        let content = `========================================================\n`;
        content += `  自我價值探索問卷 (IKIGAI 框架) - 匯出結果\n`;
        content += `========================================================\n\n`;
        content += `匯出時間戳記: ${timestamp}\n`;
        content += `--------------------------------------------------------\n`;
        content += `[ 基本資訊 ]\n`;
        content += `暱稱 (選填): ${d.nickname || '【未填寫】'}\n`;
        content += `日期: ${d.date || '【未填寫】'}\n`;
        content += `--------------------------------------------------------\n\n`;

        SECTIONS.filter(s => s.questions).forEach(section => {
            content += `[ ${section.title} ]\n`;
            if (section.subtitle) {
                content += `${section.subtitle}\n`;
            }
            content += `--------------------------------------------------------\n`;
            section.questions.forEach(q => {
                const qAnswers = Array.isArray(d[q.id]) 
                                ? d[q.id].filter(a => a.trim() !== '') 
                                : [];
                
                content += `Q: ${q.label}\n`;
                if (qAnswers.length > 0) {
                    qAnswers.forEach((ans) => {
                        content += `— ${ans}\n`;
                    });
                } else {
                    content += `A: 【未作答】\n`;
                }
                content += `\n`;
            });
        });

        content += `========================================================\n`;
        content += `  本檔案所有內容皆在用戶的瀏覽器中產生，不曾上傳至任何伺服器。\n`;
        content += `========================================================\n`;
        return content;
    };

    const generateJsonContent = () => {
        const jsonOutput = {
            metadata: {
                generated_at: new Date().toISOString(),
                schema_version: "ikigai.v1",
                nickname: answers.nickname,
                date: answers.date,
            },
            answers: {}
        };
        
        SECTIONS.filter(s => s.questions).forEach(section => {
            jsonOutput.answers[section.id] = {
                title: section.title,
                questions: {}
            };
            section.questions.forEach(q => {
                const qAnswers = Array.isArray(answers[q.id]) 
                                ? answers[q.id].filter(a => a.trim() !== '') 
                                : [];
                jsonOutput.answers[section.id].questions[q.id] = {
                    label: q.label,
                    answers: qAnswers
                };
            });
        });
        return JSON.stringify(jsonOutput, null, 2);
    };

    const downloadFile = (type) => {
        let content, mimeType;

        const safeNickname = (answers.nickname || 'student')
                             .replace(/[^\u4e00-\u9fa5\u3040-\u30ff\u31f0-\u31ff\uac00-\ud7af\w-]/g, '') 
                             .substring(0, 30)
                             .toLowerCase() || 'student';
        
        const dateStr = answers.date.replace(/-/g, '');
        const filename = `ikigai_${dateStr}_${safeNickname}.${type}`;
        
        if (type === 'txt') {
            content = generateTxtContent();
            mimeType = 'text/plain;charset=utf-8';
        } else if (type === 'json') {
            content = generateJsonContent();
            mimeType = 'application/json';
        } else {
            return;
        }

        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    // ====================== 渲染元件 ======================

    const renderIntro = () => {
        const section = SECTIONS[0];
        return (
            <div className="page-content active p-6 bg-white rounded-xl shadow-lg space-y-6">
                <h1 className="text-3xl font-extrabold text-gray-900">{section.title}</h1>
                <div className="text-gray-700 leading-relaxed bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <p className="font-medium text-indigo-800">「這裡有一些問題，都是沒有標準答案的題目。請放輕鬆，誠實地寫下腦中閃過的第一個想法；如果現在還沒有想法，也可以寫『還沒有想法』。準備好了嗎？我們一圈一圈開始回答吧！」</p>
                </div>

                <div className="space-y-4">
                    <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">暱稱</label>
                    <input type="text" id="nickname" value={answers.nickname} onChange={handleInputChange}
                           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150"
                           placeholder="請輸入你的暱稱 (選填)" />
                </div>

                <div className="space-y-4">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">日期</label>
                    <input type="date" id="date" value={answers.date} onChange={handleInputChange}
                           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150" />
                </div>
                
                <button onClick={clearDraft} className="text-sm text-red-600 hover:text-red-800 transition duration-150 mt-4 underline">
                    清空草稿並重設問卷
                </button>
            </div>
        );
    };

    const renderSection = (section) => {
        return (
            <div className="space-y-8">
                <div className="page-content active p-6 bg-white rounded-xl shadow-lg space-y-8">
                    <h1 className="text-2xl font-bold text-indigo-700">{section.title}</h1>
                    <p className="text-gray-600 border-l-4 border-indigo-400 pl-3">{section.subtitle}</p>
                    
                    {section.questions.map(q => {
                        // 確保答案是陣列，如果沒有，預設三個空字串
                        let qAnswers = answers[q.id] || ['', '', '']; 
                        if (!Array.isArray(qAnswers)) {
                             // Handle case where old draft format might be a single string
                             qAnswers = [qAnswers];
                        }
                        // 確保至少有 3 個空框
                        while (qAnswers.length < 3) {
                            qAnswers.push('');
                        }

                        const helperHtml = q.helper ? <p className="text-sm text-gray-500">{q.helper}</p> : null;

                        return (
                            <div key={q.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                <label htmlFor={q.id} className="block text-lg font-semibold text-gray-800">{q.label}</label>
                                {helperHtml}
                                
                                <div id={`${q.id}-answers`} className="space-y-3">
                                    {qAnswers.map((answer, index) => {
                                        const inputId = `${q.id}_${index}`;
                                        return (
                                            <div key={inputId} className="flex items-start space-x-2">
                                                <textarea
                                                    id={inputId}
                                                    rows="1"
                                                    aria-label={`${q.label} 答案 ${index + 1}`}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-inner transition duration-150"
                                                    value={answer}
                                                    onChange={handleInputChange}
                                                    ref={el => textareaRefs.current[inputId] = el}
                                                />
                                                <button onClick={() => removeAnswer(q.id, index)} type="button" 
                                                        className="h-10 w-10 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition duration-150 flex-shrink-0"
                                                        aria-label="移除此作答框">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <button onClick={() => addAnswer(q.id)} type="button" 
                                        className="w-full px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition duration-150 mt-2 flex items-center justify-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    <span>+ 新增框框</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="text-center text-sm text-gray-500 mt-4">
                    <p>尚未填完，可以先跳過，稍後再回來填寫，低壓引導，不要造成壓力。</p>
                </div>
            </div>
        );
    };

    const renderPreview = () => {
        const allSections = SECTIONS.filter(s => s.questions);
        const currentNickname = answers.nickname || '未填寫';
        
        return (
            <div className="page-content active p-6 bg-white rounded-xl shadow-lg space-y-6">
                <h1 className="text-3xl font-extrabold text-gray-900">{SECTIONS[currentPageIndex].title}</h1>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => downloadFile('txt')} className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md">
                        一鍵下載 TXT（推薦）
                    </button>
                    <button onClick={() => downloadFile('json')} className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition duration-150 shadow-md">
                        匯出 JSON
                    </button>
                </div>
                
                {/* 基本資訊 */}
                <h2 className="text-xl font-bold text-gray-900 mt-6 border-b pb-2">基本資訊</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mt-4">
                    <div className="col-span-2 sm:col-span-1">
                        <span className="font-medium text-gray-500">暱稱：</span>
                        <span className="font-bold text-indigo-700">{currentNickname}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <span className="font-medium text-gray-500">日期：</span>
                        <span>{answers.date || '未填寫'}</span>
                    </div>
                </div>

                {/* 問答內容 */}
                {allSections.map(section => (
                    <React.Fragment key={section.id}>
                        <h2 className="text-xl font-bold text-indigo-700 mt-6 border-b pb-2">{section.title}</h2>
                        {section.questions.map(q => {
                            const qAnswers = Array.isArray(answers[q.id]) 
                                            ? answers[q.id].filter(a => a.trim() !== '') 
                                            : [];
                            
                            const answerContent = qAnswers.length > 0
                                ? qAnswers.map(ans => `— ${ans}`).join('\n')
                                : '【未作答】';

                            return (
                                <div key={q.id} className="mt-4 p-4 bg-gray-50 rounded-lg shadow-inner">
                                    <p className="text-base font-semibold text-gray-800">{q.label}</p>
                                    <p className="whitespace-pre-wrap text-gray-700 mt-2">{answerContent}</p>
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const renderCurrentPage = () => {
        const currentSection = SECTIONS[currentPageIndex];
        if (currentSection.isIntro) return renderIntro();
        if (currentSection.isPreview) return renderPreview();
        return renderSection(currentSection);
    };

    const renderTabs = () => {
        return (
            <nav id="step-tabs" className="flex overflow-x-auto whitespace-nowrap space-x-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {SECTIONS.map((section, idx) => {
                    const isActive = idx === currentPageIndex;
                    const baseClasses = 'px-3 py-1.5 text-sm font-medium rounded-full transition duration-150 ease-in-out cursor-pointer flex-shrink-0 border';
                    const activeClasses = 'bg-indigo-600 text-white border-indigo-600 shadow-md';
                    const inactiveClasses = 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:text-indigo-700';

                    return (
                        <button key={section.id} onClick={() => goToPage(idx)}
                                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                                aria-current={isActive ? 'step' : 'false'}>
                            {section.stepTitle}
                        </button>
                    );
                })}
            </nav>
        );
    };

    const renderControls = () => {
        const index = currentPageIndex;
        const total = SECTIONS.length;
        
        let navHtml = [];

        // 上一頁按鈕
        if (index > 0) {
            navHtml.push(
                <button key="prev" onClick={() => goToPage(index - 1)} className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition duration-150">
                    上一頁
                </button>
            );
        } else {
            navHtml.push(
                <button key="prev" disabled className="px-4 py-2 bg-gray-100 text-gray-400 font-medium rounded-lg cursor-not-allowed">
                    上一頁
                </button>
            );
        }

        // 直接跳到預覽按鈕
        if (index > 0 && index < total - 1) {
            navHtml.push(
                <button key="jump" onClick={() => goToPage(total - 1)} className="px-4 py-2 bg-indigo-100 text-indigo-600 font-medium rounded-lg hover:bg-indigo-200 transition duration-150">
                    直接跳到預覽
                </button>
            );
        }

        // 下一頁/完成並預覽/返回修改按鈕
        if (index < total - 1) {
            const nextText = index === 0 ? '開始作答' : (index === total - 2 ? '完成並預覽' : '下一頁');
            navHtml.push(
                <button key="next" onClick={() => goToPage(index + 1)} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md">
                    {nextText}
                </button>
            );
        } else {
            // 預覽頁的返回修改按鈕
            navHtml.push(
                <button key="back" onClick={() => goToPage(index - 1)} className="px-4 py-2 bg-transparent border border-gray-400 text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition duration-150">
                    返回修改
                </button>
            );
        }
        
        return navHtml;
    };

    const progress = (currentPageIndex / (SECTIONS.length - 1)) * 100;
    
    // 雖然 Vite setup 已經處理了 CSS，但為了確保這些特定的 custom style 仍在，我們將其放在 style 標籤內
    return (
        <>
            {/* 這裡使用一個 style 標籤來包含原版 HTML 中的自定義 CSS，以保證 textarea 的樣式和字體 */}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                    body {
                        font-family: 'Inter', sans-serif;
                        background-color: #f4f4f5; /* 輕微的灰色背景 */
                    }
                    /* 自定義捲軸樣式 (僅適用於 Webkit 瀏覽器) */
                    textarea::-webkit-scrollbar {
                        width: 8px;
                    }
                    textarea::-webkit-scrollbar-thumb {
                        background-color: #cbd5e1; /* 灰藍色滑塊 */
                        border-radius: 4px;
                    }
                    textarea::-webkit-scrollbar-track {
                        background-color: #f1f5f9; /* 淺色軌道 */
                    }
                    /* 強制 textarea 保持一致的字體和行高 */
                    textarea {
                        line-height: 1.5;
                        font-size: 1rem;
                        resize: none;
                        overflow: hidden; /* 預設隱藏捲軸，由 JS 控制高度 */
                        min-height: 48px; /* 簡答框最小高度 (單行) */
                        transition: all 0.1s ease-out; /* 平滑過渡 */
                    }
                    /* 隱藏未選擇頁面的內容 (在 React 中不使用，但保留原始定義) */
                    .page-content:not(.active) {
                        display: block; /* 讓 React 處理顯示/隱藏 */
                    }
                    /* 隱藏 Tabs 的捲軸 */
                    #step-tabs::-webkit-scrollbar {
                        display: none;
                    }
                    #step-tabs {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>
            
            <div role="status" aria-live="polite" className="sr-only"></div>

            <div className="min-h-screen flex flex-col antialiased">
                <div className="flex-grow container mx-auto p-4 md:p-8 max-w-2xl">
                    
                    {/* 頂部 Header: 包含進度條和導航分頁 */}
                    <header className="sticky top-0 bg-white z-10 pt-2 pb-4 shadow-sm border-b border-gray-200">
                        {/* 進度條 */}
                        <div id="progress-bar" className="w-full h-2 rounded-full bg-gray-300 overflow-hidden mb-3 shadow-inner">
                            <div id="progress-indicator" className="h-full bg-indigo-600 transition-all duration-500 ease-in-out" style={{ width: `${progress}%` }}></div>
                        </div>
                        
                        {/* 導航分頁 Tabs */}
                        {renderTabs()}
                    </header>

                    {/* 主要內容區域 */}
                    <main className="flex flex-col space-y-6 pt-4">
                        {renderCurrentPage()}
                    </main>
                    
                    {/* 頂部錯誤提示 (僅用於暱稱提醒) */}
                    {error && (
                        <div role="alert" className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
                            <h3 className="font-bold mb-1">注意：檔案命名提醒</h3>
                            <p id="error-message">{error}</p>
                        </div>
                    )}
                </div>

                {/* 底部控制與版權資訊 */}
                <footer className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-20">
                    <div className="container mx-auto max-w-2xl flex justify-between items-center text-sm flex-wrap gap-3">
                        
                        {/* 隱私聲明 */}
                        <p className="text-gray-500 w-full text-center sm:text-left">
                            本頁所有資料皆在你的瀏覽器中處理，不會上傳到伺服器。
                        </p>

                        {/* 導航控制 */}
                        <div id="navigation-controls" className="flex justify-center sm:justify-end gap-2 w-full">
                            {renderControls()}
                        </div>
                        
                        {/* 資源連結 */}
                        <div className="w-full text-center sm:text-right mt-2">
                            <a href="https://notebooklm.google.com/notebook/5f53f2f5-128f-473e-8d7e-96bf5805b8d2?authuser=1" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out font-medium">
                                延伸資源：以問卷發現對應台灣大學學群 / 專業探索（NotebookLM）
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}