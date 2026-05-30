import Link from 'next/link';
import { Phone, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface FooterProps {
    onOpenHelp: () => void;
}

export function Footer({ onOpenHelp }: FooterProps) {
    const { language } = useLanguage();

    return (
        <footer className="bg-card border-t border-border py-12">
            <div className="container mx-auto px-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-xl">🌾</span>
                            </div>
                            <div>
                                <span className="font-heading font-bold text-lg">{language === 'hi' ? 'श्री अन्न' : language === 'te' ? 'శ్రీ అన్న' : language === 'kn' ? 'ಶ್ರೀ ಅನ್ನ' : language === 'ta' ? 'ஸ்ரீ அன்னா' : language === 'mr' ? 'श्री अन्न' : 'Shree Anna'}</span>
                                <span className="block text-xs text-muted-foreground">{language === 'hi' ? 'बाजरा मार्केटप्लेस' : language === 'te' ? 'చిరుధాన్యాల మార్కెట్‌ప్లేస్' : language === 'kn' ? 'ಸಿರಿಧಾನ್ಯ ಮಾರುಕಟ್ಟೆ' : language === 'ta' ? 'சிறுதானிய சந்தை' : language === 'mr' ? 'ज्वारी-बाजरी मार्केटप्लेस' : 'Millets Marketplace'}</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            {language === 'hi' ? 'निष्पक्ष और पारदर्शी बाजरा व्यापार के लिए छोटे किसानों को तकनीक से सशक्त बनाना।' : language === 'te' ? 'న్యాయమైన మరియు పారదర్శక చిరుధాన్యాల వాణిజ్యం కోసం చిన్న రైతులను సాంకేతికతో శక్తివంతం చేయడం.' : language === 'kn' ? 'ನ್ಯಾಯಯುತ ಮತ್ತು ಪಾರದರ್ಶಕ ಸಿರಿಧಾನ್ಯ ವ್ಯಾಪಾರಕ್ಕಾಗಿ ಸಣ್ಣ ರೈತರನ್ನು ತಂತ್ರಜ್ಞಾನದೊಂದಿಗೆ ಸಬಲೀಕರಣಗೊಳಿಸುವುದು.' : language === 'ta' ? 'நியாயமான மற்றும் வெளிப்படையான சிறுதானிய வர்த்தகத்திற்காக சிறு விவசாயிகளை தொழில்நுட்பத்துடன் மேம்படுத்துதல்.' : language === 'mr' ? 'निष्पक्ष आणि पारदर्शक ज्वारी-बाजरी व्यापारासाठी छोट्या शेतकऱ्यांना तंत्रज्ञानाने सक्षम करणे.' : 'Empowering smallholder farmers with technology for fair and transparent millet trade.'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <Phone className="w-4 h-4 inline mr-1" />
                            {language === 'hi' ? 'टोल-फ्री: 1800-XXX-XXXX' : language === 'te' ? 'టోల్-ఫ్రీ: 1800-XXX-XXXX' : language === 'kn' ? 'ಟೋಲ್-ಫ್ರೀ: 1800-XXX-XXXX' : language === 'ta' ? 'இலவச அழைப்பு: 1800-XXX-XXXX' : language === 'mr' ? 'टोल-फ्री: 1800-XXX-XXXX' : 'Toll-free: 1800-XXX-XXXX'}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">{language === 'hi' ? 'त्वरित लिंक' : language === 'te' ? 'శీఘ్ర లింక్‌లు' : language === 'kn' ? 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು' : language === 'ta' ? 'விரைவு இணைப்புகள்' : language === 'mr' ? 'जलद दुवे' : 'Quick Links'}</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/marketplace" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'मार्केटप्लेस' : language === 'te' ? 'మార్కెట్‌ప్లేస్' : language === 'kn' ? 'ಮಾರುಕಟ್ಟೆ' : language === 'ta' ? 'சந்தை' : language === 'mr' ? 'मार्केटप्लेस' : 'Marketplace'}</Link></li>
                            <li><Link href="/farmer/dashboard" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'किसान डैशबोर्ड' : language === 'te' ? 'రైతు డాష్‌బోర్డ్' : language === 'kn' ? 'ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : language === 'ta' ? 'விவசாயಿ டாஷ்போர்டு' : language === 'mr' ? 'शेतकरी डॅशबोर्ड' : 'Farmer Dashboard'}</Link></li>
                            <li><Link href="/buyer/dashboard" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'खरीदार डैशबोर्ड' : language === 'te' ? 'కొనుగోలుదారు డాష్‌బోర్డ్' : language === 'kn' ? 'ಖರೀದಿದಾರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : language === 'ta' ? 'வாங்குபவர் டாஷ்போர்டு' : language === 'mr' ? 'खरेदीदार डॅशबोर्ड' : 'Buyer Dashboard'}</Link></li>
                            <li><Link href="/schemes" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'सरकारी योजनाएं' : language === 'te' ? 'ప్రభుత్వ పథకాలు' : language === 'kn' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು' : language === 'ta' ? 'அரசு திட்டங்கள்' : language === 'mr' ? 'सरकारी योजना' : 'Government Schemes'}</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold mb-4">{language === 'hi' ? 'सहायता' : language === 'te' ? 'సహాయం' : language === 'kn' ? 'ಬೆಂಬಲ' : language === 'ta' ? 'ஆதரவு' : language === 'mr' ? 'मदत' : 'Support'}</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/help" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'सहायता केंद्र' : language === 'te' ? 'సహాయ కేంద్రం' : language === 'kn' ? 'ಸಹಾಯ ಕೇಂದ್ರ' : language === 'ta' ? 'உதவி மையம்' : language === 'mr' ? 'मदत केंद्र' : 'Help Center'}</Link></li>
                            <li><Link href="/faq" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : language === 'te' ? 'తరచుగా అడిగే ప్రశ్నలు' : language === 'kn' ? 'ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು' : language === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : language === 'mr' ? 'वारंवार विचारले जाणारे प्रश्न' : 'FAQs'}</Link></li>
                            <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'संपर्क करें' : language === 'te' ? 'మమ్మల్ని సంప్రదించండి' : language === 'kn' ? 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ' : language === 'ta' ? 'எங்களை தொடர்பு கொள்ளுங்கள்' : language === 'mr' ? 'आमच्याशी संपर्क साधा' : 'Contact Us'}</Link></li>
                            <li><button onClick={onOpenHelp} className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'कॉलबैक का अनुरोध करें' : language === 'te' ? 'కాల్‌బ్యాక్ అభ్యర్థించండి' : language === 'kn' ? 'ಕಾಲ್‌ಬ್ಯಾಕ್ ವಿನಂತಿಸಿ' : language === 'ta' ? 'திரும்ப அழைக்க கோருங்கள்' : language === 'mr' ? 'कॉलबॅक विनंती करा' : 'Request Callback'}</button></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold mb-4">{language === 'hi' ? 'कानूनी' : language === 'te' ? 'చట్టపరమైన' : language === 'kn' ? 'ಕಾನೂನು' : language === 'ta' ? 'சட்டப்பூர்வ' : language === 'mr' ? 'कायदेशीर' : 'Legal'}</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'गोपनीयता नीति' : language === 'te' ? 'గోప్యతా విధానం' : language === 'kn' ? 'ಗೌಪ್ಯತೆ ನೀತಿ' : language === 'ta' ? 'தனியுரிமைக் கொள்கை' : language === 'mr' ? 'गोपनीयता धोरण' : 'Privacy Policy'}</Link></li>
                            <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'सेवा की शर्तें' : language === 'te' ? 'సేవా నిబంధనలు' : language === 'kn' ? 'ಸೇವಾ ನಿಯಮಗಳು' : language === 'ta' ? 'சேவை விதிமுறைகள்' : language === 'mr' ? 'सेवा अटी' : 'Terms of Service'}</Link></li>
                            <li><Link href="/refund" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'धनवापसी नीति' : language === 'te' ? 'రీఫండ్ విధానం' : language === 'kn' ? 'ಮರುಪಾವತಿ ನೀತಿ' : language === 'ta' ? 'பணத்தை திருப்பி அளிக்கும் கொள்கை' : language === 'mr' ? 'परतावा धोरण' : 'Refund Policy'}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2024 {language === 'hi' ? 'श्री अन्न। भारतीय किसानों के लिए ❤️ से बनाया गया।' : language === 'te' ? 'శ్రీ అన్న. భారతీయ రైతుల కోసం ❤️ తో తయారు చేయబడింది.' : language === 'kn' ? 'ಶ್ರೀ ಅನ್ನ. ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ❤️ ಯಿಂದ ತಯಾರಿಸಲಾಗಿದೆ.' : language === 'ta' ? 'ஸ்ரீ அன்னா. இந்திய விவசாயிகளுக்காக ❤️ உடன் உருவாக்கப்பட்டது.' : language === 'mr' ? 'श्री अन्न. भारतीय शेतकऱ्यांसाठी ❤️ ने बनवले.' : 'Shree Anna. Made with ❤️ for Indian Farmers.'}
                    </p>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-xs">
                            <Leaf className="w-3 h-3 mr-1" />
                            {language === 'hi' ? 'कार्बन न्यूट्रल' : language === 'te' ? 'కార్బన్ న్యూట్రల్' : language === 'kn' ? 'ಕಾರ್ಬನ್ ನ್ಯೂಟ್ರಲ್' : language === 'ta' ? 'கார்பன் நியூட்ரல்' : language === 'mr' ? 'कार्बन न्यूट्रल' : 'Carbon Neutral'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            🇮🇳 {language === 'hi' ? 'भारत में बना' : language === 'te' ? 'భారతదేశంలో తయారైంది' : language === 'kn' ? 'ಭಾರತದಲ್ಲಿ ತಯಾರಿಸಲಾಗಿದೆ' : language === 'ta' ? 'இந்தியாவில் தயாரிக்கப்பட்டது' : language === 'mr' ? 'भारतात बनवले' : 'Made in India'}
                        </Badge>
                    </div>
                </div>
            </div>
        </footer>
    );
}
