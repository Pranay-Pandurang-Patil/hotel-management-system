import { Bell, Building2, Check, LockKeyhole, Save, UserRound, ShieldCheck, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

type SettingsState = {
  hotelName: string; phone: string; email: string; address: string; gstin: string;
  displayName: string; username: string; paymentAlerts: boolean; housekeepingAlerts: boolean;
  revenueSummary: boolean; twoFactor: boolean; sessionTimeout: number;
};

const defaults: SettingsState = {
  hotelName: "HotelOS Grand Hotel", phone: "+91 98765 43210", email: "admin@hotelos.demo",
  address: "MG Road, Bengaluru, Karnataka - 560001", gstin: "29AAAAA0000A1Z5",
  displayName: "Hotel Admin", username: "admin", paymentAlerts: true, housekeepingAlerts: true,
  revenueSummary: true, twoFactor: false, sessionTimeout: 30,
};
const KEY = "hotelos_settings_v2";
const load = (): SettingsState => { try { const raw = localStorage.getItem(KEY); return raw ? { ...defaults, ...JSON.parse(raw) } : defaults; } catch { return defaults; } };

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>(load);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => setSettings((s) => ({ ...s, [key]: value }));
  const save = () => {
    localStorage.setItem(KEY, JSON.stringify(settings));
    if (newPassword.trim()) localStorage.setItem("hotelos_demo_password", newPassword.trim());
    setNewPassword(""); setSaved(true); setTimeout(() => setSaved(false), 1800);
  };
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(settings)); }, [settings]);

  return <div className="module-page">
    <div className="module-header"><div><span className="eyebrow">SYSTEM CONFIGURATION</span><h1>Hotel & System Settings</h1><p>These controls are functional and persist in this browser for the demo environment.</p></div><button className="primary-button" onClick={save}>{saved ? <Check size={15}/> : <Save size={15}/>} {saved ? "Changes Saved" : "Save Changes"}</button></div>

    <div className="settings-grid">
      <section className="settings-card"><div className="settings-card-head"><div className="settings-icon"><Building2 size={18}/></div><div><h2>Hotel Profile & Branding</h2><p>Information used on invoices and hotel identity.</p></div></div>
        <label>Hotel Commercial Name<input value={settings.hotelName} onChange={(e)=>update("hotelName",e.target.value)} /></label>
        <div className="two-fields"><label>Phone Number<input value={settings.phone} onChange={(e)=>update("phone",e.target.value)} /></label><label>Email Address<input value={settings.email} onChange={(e)=>update("email",e.target.value)} /></label></div>
        <label>Property Address<textarea value={settings.address} onChange={(e)=>update("address",e.target.value)} /></label>
        <label>GSTIN<input value={settings.gstin} onChange={(e)=>update("gstin",e.target.value.toUpperCase())} /></label>
      </section>

      <section className="settings-card"><div className="settings-card-head"><div className="settings-icon"><UserRound size={18}/></div><div><h2>Administrator Profile</h2><p>Demo account settings used by the login layer.</p></div></div>
        <label>Display Name<input value={settings.displayName} onChange={(e)=>update("displayName",e.target.value)} /></label>
        <label>Username<input value={settings.username} onChange={(e)=>update("username",e.target.value)} /></label>
        <label>New Demo Password<input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="Leave blank to keep current" /></label>
        <small style={{color:"var(--muted)"}}>Changing the demo password updates the local browser credential used by Login.</small>
      </section>

      <section className="settings-card"><div className="settings-card-head"><div className="settings-icon"><Bell size={18}/></div><div><h2>System Alerts</h2><p>These toggles control notification visibility.</p></div></div>
        {[['paymentAlerts','Payment Pending Alerts','Show unpaid-balance alerts.'],['housekeepingAlerts','Housekeeping Alerts','Show cleaning and maintenance alerts.'],['revenueSummary','Daily Revenue Summary','Show operational revenue signals.']].map(([key,title,desc])=><div className="toggle-row" key={key}><div><strong>{title}</strong><span>{desc}</span></div><input type="checkbox" checked={settings[key as keyof SettingsState] as boolean} onChange={(e)=>update(key as keyof SettingsState,e.target.checked as never)} /></div>)}
      </section>

      <section className="settings-card"><div className="settings-card-head"><div className="settings-icon"><LockKeyhole size={18}/></div><div><h2>Security & Sessions</h2><p>Functional controls for this portfolio environment.</p></div></div>
        <div className="security-row"><span><ShieldCheck size={15}/> Two-factor authentication</span><strong>{settings.twoFactor ? "Enabled" : "Disabled"}</strong><button onClick={()=>update("twoFactor",!settings.twoFactor)}>{settings.twoFactor ? "Disable" : "Enable"}</button></div>
        <div className="security-row"><span><Clock3 size={15}/> Session Timeout</span><strong>{settings.sessionTimeout} minutes</strong><select value={settings.sessionTimeout} onChange={(e)=>update("sessionTimeout",Number(e.target.value))}><option value={15}>15 min</option><option value={30}>30 min</option><option value={60}>60 min</option><option value={120}>120 min</option></select></div>
      </section>
    </div>
  </div>;
}
