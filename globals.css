"use client";
import { useState, useRef } from "react";
const DIMS = [
  { id:"need", label:"Statement of Need", weight:15, icon:"◈", desc:"Clarity, urgency, and evidence-based articulation of the problem" },
  { id:"goals", label:"Goals & Objectives", weight:15, icon:"◎", desc:"SMART criteria adherence and alignment to funder priorities" },
  { id:"methodology", label:"Program Design & Methodology", weight:20, icon:"◉", desc:"Evidence-based approach, innovation, and implementation clarity" },
  { id:"evaluation", label:"Evaluation Plan", weight:15, icon:"◐", desc:"Data collection rigor, metrics quality, and accountability structures" },
  { id:"budget", label:"Budget Justification", weight:15, icon:"◑", desc:"Cost reasonableness, line-item clarity, and leverage/match" },
  { id:"capacity", label:"Organizational Capacity", weight:10, icon:"◒", desc:"Track record, leadership, partnerships, and infrastructure" },
  { id:"equity", label:"Equity & Inclusion", weight:5, icon:"◓", desc:"Demonstrated commitment to serving underrepresented populations" },
  { id:"sustainability", label:"Sustainability", weight:5, icon:"◔", desc:"Plan for continuation beyond grant period" },
];
const GRANT_TYPES = [
  { value:"federal", label:"Federal Grant (NOFO / RFP)" },
  { value:"state", label:"State Agency Grant" },
  { value:"foundation", label:"Private Foundation" },
  { value:"corporate", label:"Corporate / CSR" },
  { value:"community", label:"Community Foundation" },
  { value:"capacity", label:"Capacity Building Grant" },
];
const LOADING_MSGS = [
  "Parsing grant application structure...","Evaluating statement of need...",
  "Analyzing methodology rigor...","Scoring budget justification...",
  "Checking evaluation framework...","Running equity & sustainability audit...",
  "Calculating weighted composite score...","Generating reviewer recommendations...",
];
function getTier(score) {
  if (score >= 90) return { label:"FUNDABLE", color:"#00d084", bg:"rgba(0,208,132,0.1)", border:"rgba(0,208,132,0.3)" };
  if (score >= 75) return { label:"COMPETITIVE", color:"#3b9eff", bg:"rgba(59,158,255,0.1)", border:"rgba(59,158,255,0.3)" };
  if (score >= 60) return { label:"NEEDS REVISION", color:"#f0b429", bg:"rgba(240,180,41,0.1)", border:"rgba(240,180,41,0.3)" };
  return { label:"MAJOR REWORK", color:"#f56565", bg:"rgba(245,101,101,0.1)", border:"rgba(245,101,101,0.3)" };
}
function RadialScore({ score, size=120 }) {
  const r=46, circ=2*Math.PI*r, dash=(score/100)*circ, tier=getTier(score);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke={tier.color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)"}}/>
      <text x="50" y="46" textAnchor="middle" fill={tier.color} fontSize="18" fontWeight="800" fontFamily="'Courier New',monospace">{score}</text>
      <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="'Courier New',monospace">/ 100</text>
    </svg>
  );
}
export default function Home() {
  const [step,setStep]=useState("input");
  const [grantType,setGrantType]=useState("federal");
  const [appText,setAppText]=useState("");
  const [scores,setScores]=useState(null);
  const [error,setError]=useState(null);
  const [loadingMsg,setLoadingMsg]=useState("");
  const loadingRef=useRef(null);
  async function runScore() {
    if (appText.trim().length<200) { setError("Please paste your full grant application (at least 200 characters)."); return; }
    setError(null); setStep("loading");
    let idx=0; setLoadingMsg(LOADING_MSGS[0]);
    loadingRef.current=setInterval(()=>{ idx=(idx+1)%LOADING_MSGS.length; setLoadingMsg(LOADING_MSGS[idx]); },1400);
    try {
      const res=await fetch("/api/score",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({appText,grantType}) });
      clearInterval(loadingRef.current);
      const data=await res.json();
      if (data.error) throw new Error(data.error);
      setScores(data); setStep("results");
    } catch(e) { clearInterval(loadingRef.current); setError(e.message||"Scoring failed."); setStep("input"); }
  }
  function getTotal() {
    if (!scores) return 0;
    let t=0; DIMS.forEach(d=>{ t+=((scores.dimensions[d.id]?.score||0)*d.weight)/100; }); return Math.round(t);
  }
  const total=getTotal(), tier=getTier(total);
  const s={
    wrap:{minHeight:"100vh",background:"#0a0a0f",color:"#e8e8ec",fontFamily:"'Courier New',monospace",position:"relative"},
    grid:{position:"fixed",top:0,left:0,right:0,bottom:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"},
    header:{borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"20px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",zIndex:10},
    main:{maxWidth:900,margin:"0 auto",padding:"40px 24px",position:"relative",zIndex:10},
    card:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:24,marginBottom:20},
    label:{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:3,marginBottom:8,display:"block",textTransform:"uppercase"},
    select:{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"#fff",padding:"12px 16px",fontSize:13,fontFamily:"'Courier New',monospace",outline:"none",cursor:"pointer",marginBottom:20},
    textarea:{width:"100%",minHeight:260,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#e8e8ec",padding:"16px",fontSize:12,fontFamily:"'Courier New',monospace",lineHeight:1.7,outline:"none",resize:"vertical"},
    btn:{display:"inline-flex",alignItems:"center",gap:8,background:"#3b9eff",color:"#000",border:"none",borderRadius:8,padding:"14px 28px",fontSize:12,fontFamily:"'Courier New',monospace",fontWeight:800,letterSpacing:1.5,cursor:"pointer",textTransform:"uppercase"},
    btnSec:{display:"inline-flex",alignItems:"center",gap:8,background:"transparent",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"10px 20px",fontSize:11,fontFamily:"'Courier New',monospace",fontWeight:700,letterSpacing:1.5,cursor:"pointer",textTransform:"uppercase"},
    error:{background:"rgba(245,101,101,0.1)",border:"1px solid rgba(245,101,101,0.3)",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#f56565",marginBottom:16},
  };
  return (
    <div style={s.wrap}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} select option{background:#1a1a2e;color:#fff}`}</style>
      <div style={s.grid}/>
      <div style={s.header}>
        <div style={{display:"flex",alignItems:"baseline",gap:8}}>
          <span style={{fontSize:20,fontWeight:900,color:"#fff",letterSpacing:-1}}>GRANTSCORE</span>
          <span style={{fontSize:9,background:"#3b9eff",color:"#000",padding:"2px 6px",borderRadius:3,fontWeight:800,letterSpacing:2}}>PRO</span>
        </div>
        <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:3}}>GRANT READINESS ENGINE</span>
        <span style={{fontSize:10,color:"rgba(255,255,255,0.2)",letterSpacing:1}}>FEDERAL · PRIVATE · STATE · COMMUNITY</span>
      </div>
      <div style={s.main}>
        {step==="input" && (<>
          <div style={{marginBottom:40}}>
            <h1 style={{fontSize:34,fontWeight:900,letterSpacing:-1.5,lineHeight:1.1,marginBottom:12,color:"#fff"}}>Know your score<br/><span style={{color:"#3b9eff"}}>before you submit.</span></h1>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.7,marginBottom:32,maxWidth:520}}>Paste your complete grant application and receive reviewer-grade scoring across 8 weighted dimensions with specific, actionable feedback.</p>
            <div style={{display:"flex",gap:32,marginBottom:40}}>
              {[["8","Scoring Dimensions"],["100pt","Scale"],["Federal+","Grant Types"],["AI","Reviewer Grade"]].map(([val,lab])=>(
                <div key={lab}><div style={{fontSize:20,fontWeight:900,color:"#3b9eff"}}>{val}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:2,textTransform:"uppercase"}}>{lab}</div></div>
              ))}
            </div>
          </div>
          {error && <div style={s.error}>⚠ {error}</div>}
          <div style={s.card}>
            <label style={s.label}>Grant Application Type</label>
            <select value={grantType} onChange={e=>setGrantType(e.target.value)} style={s.select}>
              {GRANT_TYPES.map(g=><option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            <label style={s.label}>Paste Your Complete Grant Application</label>
            <textarea style={s.textarea} value={appText} onChange={e=>setAppText(e.target.value)} placeholder="Paste your full application here — narrative, goals, budget justification, evaluation plan, organizational capacity, and all other sections. Minimum 200 characters."/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16}}>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",letterSpacing:1}}>{appText.length.toLocaleString()} CHARACTERS</span>
              <button style={s.btn} onClick={runScore}>SCORE APPLICATION →</button>
            </div>
          </div>
          <div style={s.card}>
            <label style={s.label}>Scoring Dimensions & Weights</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {DIMS.map(d=>(
                <div key={d.id} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <span style={{fontSize:14,color:"rgba(255,255,255,0.25)",flexShrink:0}}>{d.icon}</span>
                  <div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontWeight:700}}>{d.label} <span style={{fontSize:9,background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.4)",padding:"1px 5px",borderRadius:3}}>{d.weight}%</span></div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:2,lineHeight:1.4}}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>)}
        {step==="loading" && (
          <div style={{textAlign:"center",padding:"80px 40px"}}>
            <div style={{width:50,height:50,borderRadius:"50%",border:"2px solid rgba(59,158,255,0.2)",borderTopColor:"#3b9eff",animation:"spin 0.9s linear infinite",margin:"0 auto 24px"}}/>
            <div style={{fontSize:28,fontWeight:900,color:"#fff",marginBottom:12}}>ANALYZING</div>
            <div style={{fontSize:11,color:"#3b9eff",letterSpacing:2}}>{loadingMsg}</div>
          </div>
        )}
        {step==="results" && scores && (
          <div style={{animation:"fadeUp 0.5s ease forwards"}}>
            <div style={{display:"flex",alignItems:"center",gap:28,marginBottom:28,flexWrap:"wrap"}}>
              <RadialScore score={total} size={120}/>
              <div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:3,marginBottom:4}}>COMPOSITE SCORE</div>
                <div style={{fontSize:42,fontWeight:900,color:tier.color,lineHeight:1}}>{total}<span style={{fontSize:18,color:"rgba(255,255,255,0.3)"}}>/ 100</span></div>
                <div style={{display:"inline-block",marginTop:8,padding:"4px 12px",borderRadius:6,background:tier.bg,border:`1px solid ${tier.border}`,color:tier.color,fontSize:10,fontWeight:800,letterSpacing:2}}>{tier.label}</div>
              </div>
              <div style={{marginLeft:"auto"}}><button style={s.btnSec} onClick={()=>{setStep("input");setScores(null);}}>← NEW ANALYSIS</button></div>
            </div>
            <div style={{...s.card,borderColor:tier.border,background:tier.bg,marginBottom:16}}>
              <div style={{fontSize:9,color:tier.color,letterSpacing:3,marginBottom:6}}>REVIEWER VERDICT</div>
              <div style={{fontSize:13,color:"#fff",lineHeight:1.6}}>{scores.reviewer_verdict}</div>
            </div>
            <div style={s.card}>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:3,marginBottom:8}}>EXECUTIVE ASSESSMENT</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",lineHeight:1.75}}>{scores.executive_summary}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              <div style={{...s.card,background:"rgba(0,208,132,0.04)",borderColor:"rgba(0,208,132,0.2)"}}>
                <div style={{fontSize:9,color:"#00d084",letterSpacing:3,marginBottom:10}}>TOP STRENGTHS</div>
                {(scores.top_3_strengths||[]).map((str,i)=><div key={i} style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.65,paddingLeft:12,borderLeft:"2px solid rgba(0,208,132,0.4)",marginBottom:6}}>+ {str}</div>)}
              </div>
              <div style={{...s.card,background:"rgba(245,101,101,0.04)",borderColor:"rgba(245,101,101,0.2)"}}>
                <div style={{fontSize:9,color:"#f56565",letterSpacing:3,marginBottom:10}}>CRITICAL GAPS</div>
                {(scores.critical_gaps||[]).map((g,i)=><div key={i} style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.65,paddingLeft:12,borderLeft:"2px solid rgba(245,101,101,0.4)",marginBottom:6}}>! {g}</div>)}
              </div>
            </div>
            <div style={s.card}>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:3,marginBottom:12}}>SCORE BREAKDOWN</div>
              {DIMS.map(d=>{
                const raw=scores.dimensions[d.id]?.score||0, weighted=(raw*d.weight)/100, pct=Math.round((weighted/d.weight)*100), t=getTier(raw);
                return (<div key={d.id} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:4}}>
                    <span>{d.icon} {d.label} <span style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>{d.weight}%</span></span>
                    <span style={{color:t.color}}>{weighted.toFixed(1)}/{d.weight}</span>
                  </div>
                  <div style={{height:4,background:"rgba(255,255,255,0.07)",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:t.color,borderRadius:2,transition:"width 1s ease"}}/>
                  </div>
                </div>);
              })}
            </div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:3,marginBottom:12}}>DETAILED DIMENSION ANALYSIS</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:20}}>
              {DIMS.map(d=>{
                const data=scores.dimensions[d.id]||{}, raw=data.score||0, t=getTier(raw);
                return (<div key={d.id} style={s.card}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:2,marginBottom:4}}>{d.icon} {d.label.toUpperCase()}</div>
                  <div style={{fontSize:26,fontWeight:900,color:t.color,marginBottom:6}}>{raw}<span style={{fontSize:13,color:"rgba(255,255,255,0.25)"}}>/ 100</span></div>
                  <span style={{fontSize:9,padding:"2px 8px",borderRadius:4,background:t.bg,color:t.color,border:`1px solid ${t.border}`,fontWeight:800,letterSpacing:1.5,display:"inline-block",marginBottom:10}}>{t.label}</span>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",lineHeight:1.65,marginBottom:10}}>{data.finding}</div>
                  {(data.recommendations||[]).length>0&&(<>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:6}}>PRIORITY REVISIONS</div>
                    {data.recommendations.map((r,i)=><div key={i} style={{fontSize:10,color:"rgba(255,255,255,0.5)",lineHeight:1.6,paddingLeft:10,borderLeft:"2px solid rgba(59,158,255,0.3)",marginBottom:4}}>{i+1}. {r}</div>)}
                  </>)}
                </div>);
              })}
            </div>
            {scores.revision_priority_order&&(
              <div style={s.card}>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:3,marginBottom:12}}>RECOMMENDED REVISION ORDER</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {scores.revision_priority_order.map((id,i)=>{
                    const d=DIMS.find(x=>x.id===id); if(!d) return null;
                    const t=getTier(scores.dimensions[id]?.score||0);
                    return (<span key={id} style={{fontSize:10,padding:"5px 12px",borderRadius:6,background:t.bg,border:`1px solid ${t.border}`,color:t.color,fontWeight:700}}>
                      <span style={{color:"rgba(255,255,255,0.3)",marginRight:4}}>{i+1}.</span>{d.label.toUpperCase()}
                    </span>);
                  })}
                </div>
              </div>
            )}
            <div style={{textAlign:"center",padding:"32px 0"}}>
              <button style={s.btn} onClick={()=>{setStep("input");setScores(null);}}>SCORE ANOTHER APPLICATION →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
