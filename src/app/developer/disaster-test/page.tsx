"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Send, Phone, MapPin, Globe, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Configuration Data
const DISASTERS = [
    'Flood',
    'Heavy Rain',
    'Cyclone',
    'Drought',
    'Heatwave',
    'Carrier Test'
];

interface TestNumber {
    number: string;
    region: string;
    languageName: string;
    languageCode: string;
}

const TEST_NUMBERS: TestNumber[] = [
    { number: '+918588077790', region: 'Sultanpur Lodhi, Punjab', languageName: 'Punjabi', languageCode: 'pa' },
    { number: '+917878588814', region: 'Majuli, Assam', languageName: 'Assamese', languageCode: 'as' },
    { number: '+918595776138', region: 'Kuttanad, Kerala', languageName: 'Malayalam', languageCode: 'ml' },
    { number: '+917701895834', region: 'Nagapattinam, Tamil Nadu', languageName: 'Tamil', languageCode: 'ta' },
];

// Message Templates for Frontend Preview (Must match backend logic approximately)
const TEMPLATES: Record<string, Record<string, string>> = {
    'Flood': {
        'en': "ALERT: Flood warning issued for {region}. Please move to higher ground immediately.",
        'pa': "ਚੇਤਾਵਨੀ: {region} ਲਈ ਹੜ੍ਹ ਦੀ ਚੇਤਾਵਨੀ ਜਾਰੀ ਕੀਤੀ ਗਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਉੱਚੀ ਥਾਂ 'ਤੇ ਜਾਓ।",
        'as': "সতৰ্কবাণী: {region}ৰ বাবে বানপানীৰ সতৰ্কবাণী জাৰি কৰা হৈছে। অনুগ্ৰহ কৰি লগে লগে ওখ ঠাইলৈ যাওক।",
        'ml': "അലേർട്ട്: {region}-ൽ വെള്ളപ്പൊക്ക മുന്നറിയിപ്പ്. ഉടൻ തന്നെ ഉയർന്ന സ്ഥലങ്ങളിലേക്ക് മാറുക.",
        'ta': "எச்சரிக்கை: {region} பகுதியில் வெள்ள அபாயம். உடனடியாக மேடான பகுதிகளுக்குச் செல்லவும்."
    },
    'Heavy Rain': {
        'en': "ALERT: Heavy rainfall predicted in {region} for next 24 hours. Stay indoors.",
        'pa': "ਚੇਤਾਵਨੀ: {region} ਵਿੱਚ ਅਗਲੇ 24 ਘੰਟਿਆਂ ਲਈ ਭਾਰੀ ਮੀਂਹ ਦੀ ਭਵਿੱਖਬਾਣੀ ਕੀਤੀ ਗਈ ਹੈ। ਘਰ ਦੇ ਅੰਦਰ ਹੀ ਰਹੋ।",
        'as': "সতৰ্কবাণী: {region}ত পৰৱৰ্তী ২৪ ঘণ্টাৰ বাবে প্ৰবল বৰষুণৰ পূৰ্বানুমান। ঘৰৰ ভিতৰতে থাকক।",
        'ml': "അലേർട്ട്: {region}-ൽ അടുത്ത 24 മണിക്കൂറിൽ കനത്ത മഴയ്ക്ക് സാധ്യത. വീടിനുള്ളിൽ തന്നെ തുടരുക.",
        'ta': "எச்சரிக்கை: {region} பகுதியில் அடுத்த 24 மணி நேரத்திற்கு கனமழை பெய்யும். வீட்டிற்குள்ளேயே இருக்கவும்."
    },
    'Cyclone': {
        'en': "URGENT: Cyclone Alert for {region}. Seek shelter immediately.",
        'pa': "ਜ਼ਰੂਰੀ: {region} ਲਈ ਚੱਕਰਵਾਤ ਦੀ ਚੇਤਾਵਨੀ। ਤੁਰੰਤ ਸ਼ਰਨ ਲਓ।",
        'as': "জৰুৰী: {region}ৰ বাবে ঘূৰ্ণীবতাহৰ সতৰ্কবাণী। লগে লগে আশ্ৰয় লওক।",
        'ml': "അടിയന്തിരം: {region}-ൽ ചുഴലിക്കാറ്റ് മുന്നറിയിപ്പ്. ഉടൻ അഭയം തേടുക.",
        'ta': "அவசரம்: {region} பகுதிக்கு ுயல் எச்சரிக்கை. உடனடியாக பாதுகாப்பான இடத்திற்குச் செல்லவும்."
    },
    'Drought': {
        'en': "ADVISORY: Drought conditions in {region}. Conserve water.",
        'pa': "ਸਲਾਹ: {region} ਵਿੱਚ ਸੋਕੇ ਦੇ ਹਾਲਾਤ। ਪਾਣੀ ਦੀ ਸੰਭਾਲ ਕਰੋ।",
        'as': "পৰামৰ্শ: {region}ত খৰাং পৰিস্থিতি। পানী সংৰক্ষণ কৰক।",
        'ml': "അറിയിപ്പ്: {region}-ൽ വരൾച്ചാ സാഹചര്യം. വെള്ളം സംരക്ഷിക്കുക.",
        'ta': "அறிவுறுத்தல்: {region} பகுதியில் வறட்சி நிலை. நீரைச் சேமிக்கவும்."
    },
    'Heatwave': {
        'en': "WARNING: Severe Heatwave in {region}. Stay hydrated.",
        'pa': "ਚੇਤਾਵਨੀ: {region} ਵਿੱਚ ਭਾਰੀ ਗਰਮੀ ਦੀ ਲਹਿਰ। ਪਾਣੀ ਪੀਂਦੇ ਰਹੋ।",
        'as': "সতৰ্কবাণী: {region}ত তীব্ৰ গৰমৰ প্ৰবাহ। হাইড্ৰেটেড থাকক।",
        'ml': "മുന്നറിയിപ്പ്: {region}-ൽ കടുത്ത ഉഷ്ണതരംഗം. വെള്ളം കുടിക്കുക.",
        'ta': "எச்சரிக்கை: {region} பகுதியில் கடும் வெப்ப அலை. போதுமான அளவு தண்ணீர் குடிக்கவும்."
    },
    'Carrier Test': {
        'en': "Your verification code is 123456. Valid for 10 minutes.",
        'pa': "ਤੁਹਾਡਾ ਤਸਦੀਕੀ ਕੋਡ 123456 ਹੈ।",
        'as': "আপোনাৰ সত্যাপন ক'ড হৈছে 123456।",
        'ml': "നിങ്ങളുടെ വെരിഫിക്കേഷൻ കോഡ് 123456 ആണ്.",
        'ta': "உங்கள் சரிபார்ப்புக் குறியீடு 123456."
    }
};

export default function DisasterTestPage() {
    const [selectedNumber, setSelectedNumber] = useState(TEST_NUMBERS[0]);
    const [selectedDisaster, setSelectedDisaster] = useState(DISASTERS[0]);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<{ time: string; type: 'success' | 'error'; message: string }[]>([]);

    // Derived Preview Text
    const previewEn = TEMPLATES[selectedDisaster]['en'].replace('{region}', selectedNumber.region);
    const previewLocal = (TEMPLATES[selectedDisaster][selectedNumber.languageCode] || "").replace('{region}', selectedNumber.region);

    const handleSendAlert = async () => {
        setLoading(true);
        const logTime = new Date().toLocaleTimeString();

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005'}/api/v1/developer/disaster-alert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number: selectedNumber.number,
                    region_name: selectedNumber.region,
                    local_language: selectedNumber.languageCode,
                    disaster_type: selectedDisaster
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setLogs(prev => [{
                    time: logTime,
                    type: 'success',
                    message: `✅ Alert Sent to ${selectedNumber.region} (${selectedNumber.number}) - SID: ${data.message_sid}`
                }, ...prev]);
            } else {
                throw new Error(data.detail || 'Failed to send');
            }

        } catch (error) {
            setLogs(prev => [{
                time: logTime,
                type: 'error',
                message: `❌ Failed: ${error instanceof Error ? error.message : 'Unknown Error'}`
            }, ...prev]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Configuration */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                                Disaster Alert System
                            </h1>
                            <p className="text-neutral-400 text-sm">Developer Simulation Console</p>
                        </div>
                    </div>

                    {/* Region Selection */}
                    <section className="space-y-4">
                        <label className="text-neutral-400 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Target Region & Number
                        </label>
                        <div className="grid gap-3">
                            {TEST_NUMBERS.map((item) => (
                                <motion.div
                                    key={item.number}
                                    onClick={() => setSelectedNumber(item)}
                                    className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 relative overflow-hidden group
                    ${selectedNumber.number === item.number
                                            ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                                            : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'}`}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <h3 className={`font-semibold text-lg ${selectedNumber.number === item.number ? 'text-white' : 'text-neutral-300'}`}>
                                                {item.region}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-neutral-400">
                                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {item.number}</span>
                                                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {item.languageName}</span>
                                            </div>
                                        </div>
                                        {selectedNumber.number === item.number && (
                                            <CheckCircle className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Disaster Selection */}
                    <section className="space-y-4">
                        <label className="text-neutral-400 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Disaster Type
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {DISASTERS.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedDisaster(type)}
                                    className={`p-3 rounded-lg text-sm font-medium border transition-all
                    ${selectedDisaster === type
                                            ? 'bg-white text-black border-white'
                                            : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </section>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSendAlert}
                        disabled={loading}
                        className={`w-full py-4 text-lg font-bold rounded-xl flex items-center justify-center gap-3 transition-all
              ${loading
                                ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30'}`}
                    >
                        {loading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                />
                                Sending Alert...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Send Emergency Alert
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Right Column: Preview & Logs */}
                <div className="space-y-8">

                    {/* Mobile Preview */}
                    <div className="bg-white text-black rounded-3xl p-6 border-8 border-neutral-800 shadow-2xl max-w-sm mx-auto w-full relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-xl" />

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                    SA
                                </div>
                                <div>
                                    <h4 className="font-bold">Shree Anna Alert</h4>
                                    <p className="text-xs text-gray-500">Just now</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none">
                                    <p className="text-sm font-medium text-gray-800">{previewEn}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-2xl rounded-tl-none border border-blue-100">
                                    <p className="text-sm font-medium text-blue-900 font-hindi leading-relaxed">
                                        {previewLocal}
                                    </p>
                                    <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-400 font-medium uppercase tracking-wide">
                                        <Globe className="w-3 h-3" />
                                        {selectedNumber.languageName} Translation
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 text-center">
                                <p className="text-[10px] text-gray-400 font-mono">
                                    Sent to: {selectedNumber.number}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Logs */}
                    <div className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 p-4 h-64 overflow-hidden flex flex-col">
                        <h3 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4" /> Activity Log
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            <AnimatePresence>
                                {logs.length === 0 && (
                                    <div className="text-center text-neutral-600 text-sm mt-10 italic">
                                        Ready to send alerts...
                                    </div>
                                )}
                                {logs.map((log, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`text-sm p-3 rounded-lg border flex items-start gap-3
                      ${log.type === 'success'
                                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                                : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                                    >
                                        <span className="font-mono text-xs opacity-60 mt-0.5">{log.time}</span>
                                        <span>{log.message}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
