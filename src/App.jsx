import React, { useCallback, useEffect, useRef, useState } from "react";
import SparkleField from "./components/SparkleField";
import AutoplayVideo from "./components/AutoplayVideo";
import VideoModal from "./components/VideoModal";
import AioLogo from "./components/AioLogo";
import SiteHeader from "./components/SiteHeader";
import RotatingWord from "./components/RotatingWord";
import SplashScreen, {
  SPLASH_FIRST_MS,
  SPLASH_NAV_MS,
} from "./components/SplashScreen";
import SiteFooter from "./components/SiteFooter";
import AioPillars from "./components/AioPillars";
import ScrollToTopButton from "./components/ScrollToTopButton";
import {
  Shield,
  FileText,
  Brain,
  Users,
  AlertTriangle,
  TrendingUp,
  Scale,
  FileCheck,
  Clock,
  DollarSign,
  Radio,
  FileSignature,
  Zap,
  Lock,
  CheckCircle,
  XCircle,
  Sparkles,
  Globe,
  Eye,
  BookA,
  Map,
  BookOpen,
  Book,
  ArrowUpRight,
  Play,
} from "lucide-react";


// Shared card surface: transparent glass panel with a green border
const cardClass =
  "group p-5 rounded-2xl border border-green-500/40 bg-[#0a0f1a]/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-green-500/80 hover:shadow-[0_12px_40px_rgba(80,192,64,0.15)]";

// Vanity URL slugs for each detail page's `products` id, e.g. aioffice.com.my/zara.
// 4 matches the "zara" top-menu anchor (see `combos` below); keep the two in
// sync if it ever changes. 7's URL slug intentionally differs from its
// "zara-agent" top-menu anchor.
const PRODUCT_SLUGS = {
  1: "ai-policy-agent",
  2: "ai-legal-agent",
  3: "ai-document-agent",
  4: "zara",
  5: "ai-permit-agent",
  6: "ai-write-agent",
  7: "zaraxaioagent",
  8: "ai-fraudguard-agent",
  9: "ai-inspector-agent",
  10: "ai-budget-agent",
  11: "ai-forecast-agent",
  12: "ai-insight-agent",
};
const SLUG_TO_PRODUCT_ID = Object.fromEntries(
  Object.entries(PRODUCT_SLUGS).map(([id, slug]) => [slug, Number(id)])
);

// Reads the current URL path into a `currentPage` value ("home" or a
// products id), for the initial page load and for browser back/forward.
const pageFromLocation = () => {
  const slug = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (!slug) return "home";
  return SLUG_TO_PRODUCT_ID[slug] ?? "home";
};

const AIArsenalDashboard = () => {
  const [currentPage, setCurrentPage] = useState(pageFromLocation);
  const [language, setLanguage] = useState("en");
  const [demoOpen, setDemoOpen] = useState(false);
  // False while the splash covers the page: the page underneath stays
  // unpainted (and the particle canvas unmounted) so the splash gets the
  // whole frame budget.
  const [revealed, setRevealed] = useState(false);
  const reveal = useCallback(() => setRevealed(true), []);

  // One splash run per page. Bumping the key remounts SplashScreen, which is
  // what replays it; run 0 is the first load and gets the long version.
  const [splashRun, setSplashRun] = useState(0);
  const splashMs = splashRun === 0 ? SPLASH_FIRST_MS : SPLASH_NAV_MS;

  // Set when a header/footer link on a detail page asks for a landing-page
  // section: the scroll has to wait until the home tree is back in the DOM.
  const pendingAnchor = useRef(null);

  // The single entry point for opening a page. Every link goes through it so
  // that every page change replays the splash before its content shows.
  const navigate = useCallback((page, href) => {
    pendingAnchor.current = href && href !== "#" ? href : null;
    setCurrentPage(page);
    setRevealed(false);
    setSplashRun((run) => run + 1);

    // Reflect the page in the address bar, e.g. aioffice.com.my/zara.
    const path = page === "home" ? "/" : `/${PRODUCT_SLUGS[page] || page}`;
    if (window.location.pathname !== path) {
      window.history.pushState({ page }, "", path);
    }
  }, []);

  const goHome = useCallback((href) => navigate("home", href), [navigate]);

  // Browser back/forward: the URL already changed, so just sync the page —
  // no pushState here, that would fight the history the browser just moved.
  useEffect(() => {
    const onPopState = () => {
      pendingAnchor.current = null;
      setCurrentPage(pageFromLocation());
      setRevealed(false);
      setSplashRun((run) => run + 1);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Swapping between the home page and a detail page replaces the whole tree,
  // so this runs once the new one has mounted: land on the requested section,
  // or at the top — otherwise the new page opens at whatever offset the reader
  // had scrolled to. It waits for the reveal, because the splash holds the
  // scroll position while it is up.
  useEffect(() => {
    if (!revealed) return;
    const anchor = pendingAnchor.current;
    pendingAnchor.current = null;
    if (anchor) {
      document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentPage, revealed]);

  const getText = (key) => {
    return translations[language][key] || key;
  };

  const translations = {
    en: {
      title: "AIO",
      // subtitle: "Your AI. Your Data. Your Infra.",
      subtitle: "Work smarter, faster and better.",
      // subtitle: "Work smarter and faster.",
      subtitle2: "Truly helpful. Truly yours.",
      statsLine: "✅ 12 AI Agents ✅ RM300K Each ✅ Full Sovereign",
      aiSystems: "AI Agents",
      avgTimeSaved: "Avg Time Saved",
      monthsROI: "Months ROI",
      dataSovereign: "Data Sovereign",
      systemsTitle: "🤖 12 AI Agents",
      clickToView: "Click any system to view full details",
      powerCombos: "💥 POWER SUITES",
      deploymentStrategies: "🚀 DEPLOYMENT STRATEGIES",
      techArchitecture: "⚙️ TECH ARCHITECTURE",
      bottomLine: "🎯 THE BOTTOM LINE",
      oldWay: "❌ Old Way",
      zaraWay: "✅ ZARA WAY",
      readyToDeploy: "Ready to deploy, Sir? 🚀",
      futureQuote: '"The future of Malaysian governance is compiling..."',
      backToArsenal: "Back to Home",
      investment: "Investment",
      savedPerYear: "Saved Per Year",
      timeReduction: "Time Reduction",
      roiTimeline: "ROI Timeline",
      problemSolved: "Problem Solved",
      targetUsers: "Target Users",
      keyFeatures: "Key Features",
      howAIWorks: "How AI Works",
      llmEngine: "LLM Engine",
      ragSystem: "RAG System",
      yourDataContext: "Your Data + Context",
      automation: "Automation",
      processing247: "24/7 Processing",
      governmentBenefit: "Government Benefit",
      readyToDeploySystem: "Ready to Deploy",
      oneTimeInvestment:
        "One-time investment • Perpetual license • Full sovereignty",
      requestDemo: "Request Demo",
      viewAllSystems: "View All Systems",
      includes: "Includes:",
      totalInvestment: "Total Investment",
      systems: "Systems:",
      timeline: "Timeline:",
      roi: "ROI:",
      oldWayItems: [
        "Officers buried in paperwork",
        "Clients waiting weeks",
        "Fraud slipping through",
        "Policies lost in folders",
        "Expensive cloud subscriptions",
        "Data in foreign servers",
      ],
      zaraWayItems: [
        "AI handles routine work",
        "Clients served in minutes",
        "Fraud caught automatically",
        "Instant policy recall",
        "One-time investment",
        "Data stays in Malaysia 🇲🇾",
      ],
      techItems: [
        {
          title: "NVIDIA DGX Spark",
          desc: "On-premise supercomputer. Malaysian soil only.",
        },
        {
          title: "Open-Source LLMs",
          desc: "Full control, secure and customizable AI.",
        },
        {
          title: "100% Sovereign",
          desc: "Data never leaves Malaysia. MAMPU compliant.",
        },
      ],
      timeSaved: "Time Saved",
    },
    ms: {
      title: "🇲🇾 AIO",
      subtitle: "Your AI. Your Data. Your Infra.",
      subtitle2: "Senjata AI Gov-Tech Malaysia",
      statsLine: "12 Sistem AI • RM300K Setiap Satu • Berdaulat & Selamat",
      aiSystems: "Sistem AI",
      avgTimeSaved: "Purata Masa Jimat",
      monthsROI: "Bulan Pulangan",
      dataSovereign: "Kedaulatan Data",
      systemsTitle: "🤖 12 SISTEM AI",
      clickToView: "Klik mana-mana sistem untuk lihat butiran penuh",
      powerCombos: "💥 KOMBO BERKUASA",
      deploymentStrategies: "🚀 STRATEGI PELAKSANAAN",
      techArchitecture: "⚙️ SENI BINA TEKNOLOGI",
      bottomLine: "🎯 KESIMPULAN",
      oldWay: "❌ CARA LAMA",
      zaraWay: "✅ CARA ZARA",
      readyToDeploy: "Bersedia untuk dilaksanakan, Tuan? 🚀",
      futureQuote: '"Masa depan tadbir urus Malaysia sedang dikompil..."',
      backToArsenal: "Kembali ke Senjata",
      investment: "Pelaburan",
      savedPerYear: "Jimat Setahun",
      timeReduction: "Pengurangan Masa",
      roiTimeline: "Tempoh Pulangan",
      problemSolved: "Masalah Diselesaikan",
      targetUsers: "Pengguna Sasaran",
      keyFeatures: "Ciri-ciri Utama",
      howAIWorks: "Cara AI Berfungsi",
      llmEngine: "Enjin LLM",
      ragSystem: "Sistem RAG",
      yourDataContext: "Data Anda + Konteks",
      automation: "Automasi",
      processing247: "Pemprosesan 24/7",
      governmentBenefit: "Manfaat Kerajaan",
      readyToDeploySystem: "Bersedia Melaksanakan",
      oneTimeInvestment: "Pelaburan sekali • Lesen kekal • Kedaulatan penuh",
      requestDemo: "Minta Demo",
      viewAllSystems: "Lihat Semua Sistem",
      includes: "Termasuk:",
      totalInvestment: "Jumlah Pelaburan",
      systems: "Sistem:",
      timeline: "Jangka Masa:",
      roi: "Pulangan:",
      oldWayItems: [
        "Pegawai ditimbus kerja bertulis",
        "Rakyat menunggu berminggu-minggu",
        "Penipuan terlepas pandang",
        "Polisi hilang dalam folder",
        "Langganan awan yang mahal",
        "Data di pelayan asing",
      ],
      zaraWayItems: [
        "AI kendalikan kerja rutin",
        "Rakyat dilayan dalam minit",
        "Penipuan ditangkap automatik",
        "Ingat polisi serta-merta",
        "Pelaburan sekali sahaja",
        "Data kekal di Malaysia 🇲🇾",
      ],
      techItems: [
        {
          title: "NVIDIA DGX Spark",
          desc: "Superkomputer di premis. Hanya tanah Malaysia.",
        },
        {
          title: "LLM Sumber Terbuka",
          desc: "Llama, Mistral, Qwen. Tiada terikat vendor.",
        },
        {
          title: "100% Berdaulat",
          desc: "Data tidak keluar Malaysia. Patuh MAMPU.",
        },
      ],
      timeSaved: "Masa Jimat",
    },
  };

  const products = [
    {
      id: 1,
      name: "AI Policy Agent",
      icon: Brain,
      category: "Document Warriors",
      power: "Instant policy recall",
      savingsPerYear: "RM300K",
      timeReduction: "95%",
      color: "from-purple-500 to-purple-600",
      deployment: "Stackable",
      problemSolved:
        "Government officers often need to reference past circulars, policies, meeting minutes, legal guidelines, and best practices. Finding the right document or clause across hundreds of files stored in different folders or systems wastes hours and leads to inconsistent decision-making.",
      targetUsers: [
        "Policy officers in ministries",
        "Legal and compliance units",
        "Planning and strategy departments",
        "Training and knowledge management divisions",
      ],
      features: [
        "Natural language search across all government documents",
        "Instant answers with source citations from policy documents",
        "Summarization of long circulars and reports",
        "Comparison of policies across different years or departments",
        "Personalized knowledge base per ministry or agency",
      ],
      aiRole:
        "The LLM functions as an intelligent search assistant. RAG connects the LLM to your document repositories, allowing it to retrieve accurate information and answer questions based on actual government records—not generic internet knowledge.",
      benefit:
        "Officers get instant access to institutional knowledge. New staff onboard faster. Decisions are consistent with established policies. Reduces reliance on a few senior officers who 'know everything.'",
      roi: "8 months",
    },
    {
      id: 2,
      name: "AI Legal Agent",
      icon: Scale,
      category: "Document Warriors",
      power: "Legal research in 10 mins",
      savingsPerYear: "RM400K",
      timeReduction: "95%",
      color: "from-gray-600 to-gray-700",
      deployment: "Specialized",
      problemSolved:
        "Legal officers, drafters, and policy makers must research laws, past cases, legal opinions, and international precedents. Manually searching through volumes of legal texts and cross-referencing amendments is extremely time-consuming.",
      targetUsers: [
        "Attorney General's Chambers (AGC)",
        "Legal divisions in ministries",
        "Parliamentary drafting units",
        "Tribunal and board secretariats",
      ],
      features: [
        "Natural language search across Malaysian legislation, subsidiary laws, and case law",
        "Identifies relevant legal provisions for specific policy questions",
        "Compares Malaysian law with foreign jurisdictions",
        "Tracks regulatory changes and amendments over time",
        "Assists in drafting by suggesting standard clauses and checking consistency",
      ],
      aiRole:
        "The LLM acts as a junior legal researcher, trained on Malaysian legal corpus via RAG. It quickly locates relevant sections, summarizes precedents, and highlights potential legal conflicts tasks that would take a legal officer days.",
      benefit:
        "Accelerates legal research and policy drafting. Ensures consistency with existing laws. Reduces dependency on expensive external legal consultants. Strengthens quality of legislation and regulations.",
      roi: "8 months",
    },
    {
      id: 3,
      name: "AI Document Agent",
      icon: FileText,
      category: "Document Warriors",
      // power: "Reads & sorts like 1000 officers",
      power: getText(
        "Reads & sorts like 1000 officers",
        "Baca & susun seperti 1000 pegawai",
      ),
      savingsPerYear: "RM500K",
      timeReduction: "70%",
      color: "from-blue-500 to-blue-600",
      deployment: "Plug & Play",
      problemSolved:
        "Government agencies handle thousands of documents daily—reports, letters, forms, contracts, and client submissions. Manually reading, categorizing, extracting data, and routing these documents is slow, error-prone, and consumes significant staff time.",
      targetUsers: [
        "Ministry administrative units",
        "Agencies processing public submissions",
        "Document management teams",
        "Land offices and licensing bodies",
      ],
      features: [
        "Automatic document classification (invoice, memo, application form, etc.)",
        "Data extraction from PDFs, scanned images, and Word files",
        "Intelligent routing to appropriate departments based on content",
        "Searchable document archive with natural language queries",
        "Multi-language support (Malay, English, Chinese, Tamil)",
      ],
      aiRole:
        "The LLM reads and understands document content just like a human officer would. Combined with RAG (Retrieval-Augmented Generation), it searches previous documents to ensure consistency. Automation handles repetitive tasks like sorting and data entry, freeing officers for decision-making work.",
      benefit:
        "Reduces document processing time by 60-70%. Minimizes manual data entry errors. Allows officers to focus on policy work rather than paperwork. Ensures data sovereignty with all processing on-premise.",
      roi: "6 months",
    },
    {
      id: 4,
      name: "AI Assist Agent",
      icon: Users,
      // Detail-page hero clip; the poster sits beside it as <name>-poster.jpg.
      video: "zara-laptop.mp4",
      // Full clip the hero's "Learn more" opens in a modal.
      demoVideo: "zara-how-to-install.mp4",
      // Hero headline, when the page is entered under a product family name
      // rather than the agent's own. Falls back to `name`.
      heroTitle: "ZARA",
      // This page's own headline stack, in place of the shared
      // "Work SMARTER with AI." / "Truly helpful. Truly yours." pair.
      hero: {
        lead: "More",
        words: ["Personal", "Trusted", "Relevant"],
        tail: ".",
        subtitle: "Your AI assistant.",
      },
      category: "Client Interface",
      power: "24/7 client service",
      savingsPerYear: "RM400K",
      timeReduction: "50%",
      color: "from-green-500 to-green-600",
      deployment: "Standalone",
      problemSolved:
        "Organizations spend valuable time answering repetitive questions and helping users find information across different documents and systems. ZARA provides a 24/7 AI assistant that delivers quick, consistent answers using the organization’s own knowledge and information, reducing staff workload and improving the user experience while keeping data within the organization’s own environment.",
      targetUsers: [
        "Government agencies and public sector organizations",
        "Organizations that handle high volumes of enquiries",
        "Corporate departments such as HR, IT, and Customer Service",
        "Organizations with internal knowledge management needs",
        "Customer service centers, helpdesks, and support teams",
        "Organizations looking to adopt secure, private AI solutions",
      ],
      // Named features: each one is a short title with its own sentence under
      // it, which the Key Features list renders as two lines. The other
      // products still carry plain strings.
      features: [
        {
          title: "On-Premise AI Assistant",
          body: "Provides AI assistance within the organization’s own environment, giving greater control over information.",
        },
        {
          title: "Conversational AI Interface",
          body: "Offers a simple chat experience and can be made available through Microsoft Teams.",
        },
        {
          title: "AI assistant bot",
          body: "Answers common questions in Malay and English, anytime.",
        },
        {
          title: "Knowledge-Based Answers",
          body: "Provides answers based on the organization’s own documents, guidelines, and information.",
        },
        {
          title: "Connects to Internal Information",
          body: "Can access relevant information from the organization’s existing systems and databases.",
        },
        {
          title: "Understands the Conversation",
          body: "Maintains the context of the conversation to provide more relevant and helpful answers.",
        },
        {
          title: "Improves Over Time",
          body: "Uses feedback and past interactions to continuously improve the quality of its answers.",
        },
        {
          title: "Secure & Private",
          body: "Keeps organizational information within the organization’s controlled environment.",
        },
      ],
      // Rendered under the "How ZARA Works" heading on the detail page.
      aiRole:
        "ZARA is your organization’s on-premise AI assistant, designed to provide fast and reliable answers using your own documents, knowledge, and internal information. It helps users find information, understand procedures, and get assistance through a simple conversational interface. By connecting to your organization’s knowledge base and internal systems, ZARA delivers relevant answers while keeping your data within your own environment.",
      // A list rather than a paragraph; the Benefit section renders either.
      benefit: [
        "Reduce repetitive enquiries and workload.",
        "Provide fast, consistent answers 24/7.",
        "Help users find the right information faster.",
        "Give staff more time to focus on important tasks.",
        "Keep organizational information secure and under your control.",
      ],
      roi: "7 months",
    },
    {
      id: 5,
      name: "AI Permit Agent",
      icon: FileCheck,
      category: "Client Interface",
      power: "45 days → 7 days",
      savingsPerYear: "RM600K",
      timeReduction: "85%",
      color: "from-teal-500 to-teal-600",
      deployment: "Stackable",
      problemSolved:
        "Processing applications for business licenses, permits (construction, food handling, environmental), and registrations involves checking eligibility, verifying documents, and ensuring compliance with regulations. This is repetitive, slow, and creates bottlenecks for businesses and clients.",
      targetUsers: [
        "Local councils (PBT) processing business licenses",
        "Construction and development approval units",
        "Professional licensing boards (engineers, doctors, accountants)",
        "Trade and investment facilitation agencies (MIDA, MITI)",
      ],
      features: [
        "Automated eligibility screening based on regulatory criteria",
        "Document verification (checks for completeness, validity)",
        "Instant feedback to applicants on missing requirements",
        "Intelligent routing to approval officers based on risk level",
        "Automated approval for straightforward, low-risk applications",
      ],
      aiRole:
        "The LLM reads applications and supporting documents, comparing them against regulatory requirements stored via RAG. It identifies gaps or red flags. Automation handles routine approvals, escalating only complex or high-risk cases.",
      benefit:
        "Cuts processing time from weeks to days. Improves Malaysia's ease of doing business ranking. Reduces corruption opportunities through transparent, automated checks. Increases compliance through clear guidance to applicants.",
      roi: "6 months",
    },
    {
      id: 6,
      name: "AI Write Agent",
      icon: Clock,
      category: "Productivity",
      power: "Never forgets decisions",
      savingsPerYear: "RM200K",
      timeReduction: "75%",
      color: "from-pink-500 to-pink-600",
      deployment: "Standalone",
      problemSolved:
        "Government officers attend countless meetings. Recording minutes, tracking action items, and following up on commitments manually is tedious. Important decisions and tasks often fall through the cracks.",
      targetUsers: [
        "Meeting secretariats in ministries",
        "Cabinet and committee support units",
        "Project management offices",
        "Management teams across all agencies",
      ],
      features: [
        "Automatic transcription of meeting recordings (Malay and English)",
        "Generates structured meeting minutes with key decisions and action items",
        "Extracts and assigns tasks to responsible officers",
        "Sends automated reminders for pending actions",
        "Searchable archive of all past meetings and decisions",
      ],
      aiRole:
        "The LLM transcribes speech, identifies speakers, and understands context to summarize discussions. RAG connects to previous meeting records to track recurring issues. Automation handles task assignment and follow-up reminders.",
      benefit:
        "Saves hours of administrative work per meeting. Ensures accountability through clear action tracking. Improves organizational memory and decision continuity. Allows officers to focus on discussion, not note-taking.",
      roi: "5 months",
    },
    {
      id: 7,
      name: "AI Contract Agent",
      icon: FileSignature,
      // Same treatment as id 4: the detail page is entered from the
      // "ZARA x AIO Agent" card, so it leads with that clip and headline.
      // The body copy below is still the agent's own — to be updated.
      video: "zara-promo.mp4",
      // No dedicated demo clip for this page yet, so "Learn more" reopens the
      // same promo clip full-size — matching id 4's button, whose modal plays
      // a separate, longer install video instead.
      demoVideo: "zara-promo.mp4",
      heroTitle: "ZARA x AIO Agent",
      // Stacks the hero's brand heading onto its own line per word instead of
      // letting the browser wrap "ZARA x AIO Agent" wherever it runs out of
      // room; the logo then sits beside "ZARA" only, not the whole title.
      heroTitleLines: ["ZARA", "x", "AIO Agent"],
      // Overrides the "How ZARA x AIO Agent Works" default heading below.
      howItWorksTitle: "Chat. Act. Done.",
      // This page's own headline stack, in place of the shared
      // "Work SMARTER with AI." / "Truly helpful. Truly yours." pair.
      hero: {
        lead: "More",
        words: ["Helpful", "Powerful", "Easy"],
        tail: "",
        subtitle: "Beyond Chat. Into Action",
      },
      category: "Defense Systems",
      power: "Spots bad deals early",
      savingsPerYear: "RM450K",
      timeReduction: "80%",
      color: "from-violet-500 to-violet-600",
      deployment: "Stackable",
      problemSolved: [
        "Too many forms. Too many systems. Too many steps.",
        "ZARA x AIO Agent simplifies everyday tasks by letting users complete them directly through chat, while working with the organization’s existing local systems.",
      ],
      targetUsers: [
        "Employees — Complete everyday tasks faster, simply by chatting with ZARA.",
        "Managers — Reduce repetitive work and spend more time on important tasks.",
        "HR & Admin Teams — Simplify routine processes without managing endless forms.",
        "Organizations — Make existing systems easier to use with AI.",
      ],
      features: [
        {
          title: "Chat to Get Things Done",
          body: "Simply tell ZARA what you need and let it handle the task through conversation.",
        },
        {
          title: "No More Forms",
          body: "Complete everyday tasks without filling out lengthy forms.",
        },
        {
          title: "Works with Your Existing Systems",
          body: "ZARA works with your organization’s existing local systems to get things done.",
        },
        {
          title: "Simple & Easy to Use",
          body: "No technical knowledge needed. Just chat naturally with ZARA.",
        },
        {
          title: "Secure On-Premise AI",
          body: "Keep your organization’s information within your own environment.",
        },
        {
          title: "Available 24/7",
          body: "Get assistance and complete tasks anytime, wherever you are.",
        },
      ],
      aiRole:
        "ZARA x AIO Agent turns conversation into action. Simply tell ZARA what you need—such as applying for leave or submitting an application—and ZARA can handle the task directly through chat by working with your organization’s existing local systems. No forms to fill in. No need to switch between systems. Just ask ZARA and get it done.",
      benefit:
        "For employees, ZARA makes everyday tasks faster and easier, simply chat with ZARA to get things done without filling in forms or switching between systems. For management, ZARA helps reduce repetitive administrative work, improve productivity, and make better use of existing business systems.",
      roi: "8 months",
    },
    {
      id: 8,
      name: "AI FraudGuard Agent",
      icon: AlertTriangle,
      category: "Defense Systems",
      power: "Catches fraud instantly",
      savingsPerYear: "RM2-5M",
      timeReduction: "90%",
      color: "from-orange-500 to-orange-600",
      deployment: "Network",
      problemSolved:
        "Government agencies lose millions annually to fraudulent claims, duplicate applications, identity fraud, and abuse of public programs (subsidies, grants, welfare). Manual checking of applications against databases is incomplete and reactive.",
      targetUsers: [
        "Welfare and subsidy agencies (JKM, KPWKM)",
        "Grant and loan administrators (MARA, SME Corp, TEKUN)",
        "Revenue collection units (customs, inland revenue)",
        "Public procurement oversight bodies",
      ],
      features: [
        "Real-time screening of applications for duplicate identities or suspicious patterns",
        "Cross-reference against multiple government databases",
        "Flags unusual claim amounts, frequencies, or beneficiary profiles",
        "Generates investigation leads with evidence summaries",
        "Learns fraud patterns to improve detection accuracy",
      ],
      aiRole:
        "The LLM analyzes application text for inconsistencies (e.g., income claims vs. stated profession). RAG pulls data from historical cases to identify known fraud patterns. Automation scores each application for fraud risk.",
      benefit:
        "Prevents leakage of public funds. Ensures assistance reaches truly eligible clients. Deters fraudsters through improved detection rates. Builds public trust in government programs.",
      roi: "3 months",
    },
    {
      id: 9,
      name: "AI Inspector Agent",
      icon: Shield,
      category: "Defense Systems",
      power: "X-ray compliance vision",
      savingsPerYear: "RM600K",
      timeReduction: "80%",
      color: "from-red-500 to-red-600",
      deployment: "Stackable",
      problemSolved:
        "Regulators and auditors must review reports, financial statements, licenses, and submissions to ensure compliance with regulations. Manual review is slow and misses subtle red flags. Non-compliance often discovered only after incidents occur.",
      targetUsers: [
        "Regulatory bodies (SSM, Bank Negara, securities regulators)",
        "Internal audit units in ministries",
        "Enforcement agencies monitoring license holders",
        "Environmental and safety compliance teams",
      ],
      features: [
        "Automated review of submitted reports against regulatory checklists",
        "Flags inconsistencies, missing information, or unusual patterns",
        "Highlights high-risk submissions for officer attention",
        "Generates compliance summaries and risk scores",
        "Tracks historical compliance trends by entity",
      ],
      aiRole:
        "The LLM reads submissions and cross-checks them against regulations stored via RAG. It identifies discrepancies that might take a human hours to spot. Automation prioritizes cases, so officers focus on genuine risks, not routine checks.",
      benefit:
        "Increases audit coverage without increasing headcount. Detects non-compliance earlier, preventing costly problems. Ensures fair, consistent enforcement. Protects public interest and government reputation.",
      roi: "9 months",
    },
    {
      id: 10,
      name: "AI Budget Agent",
      icon: DollarSign,
      category: "Intelligence",
      power: "Finds hidden savings",
      savingsPerYear: "RM500K",
      timeReduction: "70%",
      color: "from-yellow-500 to-yellow-600",
      deployment: "Stackable",
      problemSolved:
        "Budget officers must analyze spending patterns, justify allocations, identify savings opportunities, and prepare reports for management and Treasury. Manual analysis of expenditure data across programs and departments is overwhelming and slow.",
      targetUsers: [
        "Finance and budget divisions in all ministries",
        "State treasury departments",
        "Agency heads preparing annual budget submissions",
        "Performance management units",
      ],
      features: [
        "Analyzes historical spending patterns by program, department, and category",
        "Identifies underspending, overspending, and potential cost savings",
        "Answers budget questions in natural language",
        "Generates draft budget narratives and justifications",
        "Compares spending against peer agencies or benchmarks",
      ],
      aiRole:
        "The LLM interprets financial data and translates it into clear insights. RAG connects to budget databases and past reports. Automation generates routine reports and highlights anomalies for officer review.",
      benefit:
        "Improves budget accuracy and accountability. Frees finance officers from repetitive reporting. Identifies efficiency gains and reallocation opportunities. Supports evidence-based resource allocation decisions.",
      roi: "9 months",
    },
    {
      id: 11,
      name: "AI Forecast Agent",
      icon: TrendingUp,
      category: "Intelligence",
      power: "Predicts 3 months ahead",
      savingsPerYear: "RM800K",
      timeReduction: "60%",
      color: "from-indigo-500 to-indigo-600",
      deployment: "Stackable",
      problemSolved:
        "Government leaders need to anticipate issues—budget shortfalls, service demand spikes, supply chain disruptions, public health trends—but currently rely on lagging indicators and reactive responses.",
      targetUsers: [
        "Economic planning units (EPU, state planning departments)",
        "Health ministries (epidemic surveillance)",
        "Treasury and finance divisions",
        "Disaster management agencies (NADMA)",
      ],
      features: [
        "Analyzes historical data to identify trends and patterns",
        "Generates forecasts for key metrics (hospital admissions, revenue collection)",
        "Issues early warnings when indicators deviate from normal patterns",
        "Provides scenario analysis ('What if unemployment rises by 2%?')",
        "Plain-language summaries for non-technical decision makers",
      ],
      aiRole:
        "The LLM interprets complex datasets and translates statistical findings into clear narratives. RAG connects to internal reports and external data sources. Automation runs periodic analyses and alerts relevant officers.",
      benefit:
        "Enables proactive policymaking instead of crisis management. Optimizes resource allocation based on predicted demand. Improves public service delivery. Demonstrates data-driven governance to stakeholders.",
      roi: "10 months",
    },
    {
      id: 12,
      name: "AI Insight Agent",
      icon: Radio,
      category: "Defense Systems",
      power: "48hr crisis warning",
      savingsPerYear: "RM300K",
      timeReduction: "100%",
      color: "from-cyan-500 to-cyan-600",
      deployment: "Standalone",
      problemSolved:
        "Government agencies need to understand public sentiment, detect emerging issues, and respond to misinformation or crises. Manually monitoring social media, news, and public feedback across platforms is impossible at scale.",
      targetUsers: [
        "Communications and public relations units (JAPEN, UPEN)",
        "Crisis management centers",
        "Policy evaluation units",
        "Service delivery agencies monitoring feedback",
      ],
      features: [
        "Monitors social media, news sites, and public forums for mentions of government programs",
        "Analyzes sentiment (positive, negative, neutral) toward policies or services",
        "Detects emerging issues or viral complaints before they escalate",
        "Summarizes daily public discourse on key topics",
        "Provides early warning on misinformation or reputational risks",
      ],
      aiRole:
        "The LLM reads and interprets public posts, news articles, and comments in multiple languages. RAG connects to historical sentiment data to identify unusual patterns. Automation continuously scans sources and alerts officers to significant shifts.",
      benefit:
        "Enables rapid response to public concerns. Prevents crises through early detection. Informs policy adjustments based on real client feedback. Protects government reputation through timely communication.",
      roi: "7 months",
    },
  ];

  // Placeholder product sections — replace title/subtitle/name/description,
  // then add a `video` field to an item once its media is ready.
  const productSections = [
    {
      id: "documents",
      title: "AI Document Processing.",
      subtitle: "Streamline your document submissions process.",
      items: [
        {
          id: "product1",
          anchor: "form-filler", // top menu link target
          name: "AIO Form Filler",
          video: "aio-form-filler-loop.mp4",
          description: "Intelligently identify the document submission category and scan photos, documents, and handwriting. Extract the required information and automatically populate the corresponding fields in your form.",
        },
        {
          id: "product2",
          anchor: "form-checker", // top menu link target
          name: "AIO Form Checker",
          video: "aio-form-checker-loop.mp4",
          description: "Intelligently cross-check submitted forms against supporting documents to verify accuracy and identify missing information. Generate a clear correction report highlighting what needs to be reviewed or corrected before submission.",
        },
      ],
    },
    {
      id: "forecast",
      title: "AI Insight and Forecast.",
      subtitle: "Turn local data into answers.",
      items: [
        {
          id: "product9",
          anchor: "insight", // top menu link target
          name: "AIO Insight",
          video: "aio-insight-loop.mp4",
          description: "Upload a spreadsheet, get instant answers. Just ask questions in natural language and watch the right charts appear — accurate, easy to read, and ready to share.",
        },
        {
          id: "product10",
          anchor: "forecast", // top menu link target
          name: "AIO Forecast",
          video: "aio-insight-loop.mp4",
          description: "See what's coming next. Upload your data and get a smart, reliable forecast in minutes — no spreadsheets, no guesswork, no data science degree needed.",
        },
      ],
    },
    // HIDDEN — uncomment to restore the "AI Compliance & Audit." section
    // {
    // id: "compliance",
    // title: "AI Compliance & Audit.",
    // subtitle: "Catch the issues before they become findings.",
    // items: [
    // {
    // id: "product3",
    // name: "AIO Policy Checker",
    // description: "Short description of this product. Replace with your own copy.",
    // },
    // {
    // id: "product4",
    // name: "AIO Audit Trail",
    // description: "Short description of this product. Replace with your own copy.",
    // },
    // ],
    // },
    // HIDDEN — uncomment to restore the "AI Knowledge & Insights." section
    // {
    // id: "insights",
    // title: "AI Knowledge & Insights.",
    // subtitle: "Turn your archives into answers.",
    // items: [
    // {
    // id: "product5",
    // name: "AIO Knowledge Base",
    // description: "Short description of this product. Replace with your own copy.",
    // },
    // {
    // id: "product6",
    // name: "AIO Report Builder",
    // description: "Short description of this product. Replace with your own copy.",
    // },
    // ],
    // },
    {
      id: "development",
      title: "AI Local Development. ",
      subtitle: "Build and learn in house — for education and internal teams.",
      items: [
        {
          id: "product7",
          anchor: "lab", // top menu link target
          name: "AIO Lab",
          image: "gb10.webp",
          description: "An on-premise AI workstation pre-installed with AI development software and tools. Designed for AI education, hands-on learning, and AI development.",
        },
        {
          id: "product8",
          anchor: "code", // top menu link target
          name: "AIO Code",
          image: "aiocode.jpg",
          description: "AI-powered coding and software development workspace for faster delivery. Manage the full SDLC, from coding and tickets to testing and progress tracking.",
        },
      ],
    },
  ];

  const combos = [
    {
      id: "combo1",
      anchor: "zara", // top menu link target
      // "Learn more" opens this `products` entry's detail page (AI Assist Agent)
      detailId: 4,
      video: "zara-laptop.mp4",
      name: "ZARA",
      systems: ["AI Policy Agent", "AI Legal Agent", "AI Document Agent"],
      cost: "RM900K",
      // One sentence per line. The landing page runs them together and lets
      // them wrap; the detail page gives each its own line.
      effect: [
        "Meet ZARA (ZEN Artificial Reasoning Assistant), your AI assistant for smarter work.",
        "Get richer answers, natural conversations, and instant access to your local knowledge base.",
      ],
      // icon: FileText,
      // icon: Map,
      icon: Book,
      color: "from-blue-500 to-purple-600",
    },
    {
      id: "combo2",
      anchor: "zara-agent", // top menu link target
      // "Learn more" opens this `products` entry's detail page (AI Contract Agent)
      detailId: 7,
      video: "zara-promo.mp4",
      name: "ZARA x AIO Agent",
      systems: [
        "AI Contract Agent",
        "AI FraudGuard Agent",
        "AI Inspector Agent",
      ],
      cost: "RM900K",
      effect: [
        "Extend ZARA into an AIO Agent that connects with your organization’s local applications.",
        "Go beyond conversations and let ZARA assist with tasks, access business systems.",
      ],
      icon: Shield,
      color: "from-red-500 to-orange-600",
    },
    {
      id: "combo3",
      name: "AI Flash",
      systems: ["AI Assist Agent", "AI Permit Agent", "AI Write Agent"],
      cost: "RM900K",
      effect: ["Hours not weeks"],
      icon: Zap,
      color: "from-green-500 to-teal-600",
    },
    {
      id: "combo4",
      name: "AI Oracle",
      systems: ["AI Budget Agent", "AI Forecast Agent", "AI Insight Agent"],
      cost: "RM900K",
      effect: ["See the future"],
      // icon: Brain,
      icon: Eye,
      color: "from-indigo-500 to-purple-600",
    },
  ];

  const deploymentTiers = [
    {
      name: "🥉 BRONZE",
      cost: "RM300K",
      systems: 1,
      timeline: "4 month",
      roi: "6 months",
    },
    {
      name: "🥈 SILVER",
      cost: "RM900K",
      systems: 3,
      timeline: "12 months",
      roi: "8 months",
    },
    {
      name: "🥇 GOLD",
      cost: "RM1.8M",
      systems: 6,
      timeline: "24 months",
      roi: "10 months",
    },
    {
      name: "💎 PLATINUM",
      cost: "RM3.6M",
      systems: 12,
      timeline: "48 months",
      roi: "12 months",
    },
  ];

  // The top menu's ZARA entry opens the suite's detail page rather than
  // scrolling to its landing section. The href is the section anchor, so the
  // suite that owns that anchor is what says which page to open.
  const openSolutionPage = (href) => {
    const detailId = combos.find((c) => c.anchor && `#${c.anchor}` === href)
      ?.detailId;
    if (detailId) navigate(detailId);
  };

  const DetailPage = ({ product }) => {
    // Suites on the landing page carry an intro paragraph; a product opened
    // from the systems grid has none, and the paragraph is simply left out.
    const comboIntro = combos.find((c) => c.detailId === product.id)?.effect;

    // The headline stack: the rotating green word with the words around it,
    // over a grey subtitle. A product can carry its own; the rest share the
    // landing page's.
    const hero = product.hero || {
      lead: "Work",
      words: ["SMARTER", "FASTER", "BETTER"],
      tail: " with AI.",
      subtitle: getText("subtitle2"),
    };

    return (
      <>
        {/* Same space background as the landing page: body paints #050810 and
            these fixed layers sit at z-0, so the content rides above at z-10. */}
        <div className="stars"></div>
        <div className="nebula"></div>
        {revealed && <SparkleField />}
        {/* The menu links target landing-page sections, so `goHome` takes the
            reader back there first and scrolls to the section afterwards. */}
        <SiteHeader onNavigate={goHome} onOpenPage={openSolutionPage} />
        {/* pt-20 clears the fixed top menu, matching the landing page. */}
        <div className="min-h-screen text-white px-4 sm:px-6 lg:px-8 pt-20 pb-10 sm:pb-14 lg:pb-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Hero — the landing page's headline stack over the video card,
                all inside one viewport-height budget. */}
            <div className="flex flex-col items-center justify-center gap-[2.5svh] mb-12 sm:mb-16 landscape:min-h-[calc(100svh-5rem)]">
              <h1 className="relative flex items-center justify-center px-4 font-extrabold text-center text-[min(12.5vw,clamp(1.75rem,6.4svh_+_0.6vw,4rem))] leading-[1.0625] tracking-[-0.009em]">
                {/* Brand mark — same lockup as the landing hero, sized in em
                    so it tracks the title's clamp at every width. */}
                {product.heroTitleLines ? (
                  <>
                    {/* Below lg: one line per word, logo beside the first only. */}
                    <div className="flex flex-col items-center justify-center lg:hidden">
                      {product.heroTitleLines.map((line, i) => (
                        <span
                          key={line}
                          className={`flex items-center justify-center gap-[0.3em] ${i === 1 ? "-mt-[0.1em]" : i > 1 ? "mt-[0.15em]" : ""}`}
                        >
                          {i === 0 && (
                            <AioLogo className="logo-glow h-[1.25em] w-[1.25em] shrink-0" />
                          )}
                          <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]">
                            {line}
                          </span>
                        </span>
                      ))}
                    </div>
                    {/* lg and up: back to a single line, logo before the whole title. */}
                    <span className="hidden items-center justify-center gap-[0.3em] lg:flex">
                      <AioLogo className="logo-glow h-[1.25em] w-[1.25em] shrink-0" />
                      <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]">
                        {product.heroTitleLines.join(" ")}
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="flex items-center justify-center gap-[0.3em]">
                    <AioLogo className="logo-glow h-[1.25em] w-[1.25em] shrink-0" />
                    <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]">
                      {product.heroTitle || product.name}
                    </span>
                  </span>
                )}
              </h1>

              <div className="max-w-4xl mx-auto text-center">
                <h1 className="font-bold text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                  {hero.lead}{" "}
                  <RotatingWord words={hero.words} className="text-green-500" />
                  {hero.tail}
                </h1>
                <h1 className="font-bold text-gray-400 mt-[1svh] text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                  {hero.subtitle}
                </h1>
              </div>

              {/* Hero video — same card and height budget as the landing page
                  hero, so it can never grow taller than the viewport allows. */}
              {product.video && (
                <div className="w-full flex justify-center px-4">
                  <div className="group relative w-[min(100%,calc(50svh*16/9))] p-3 sm:p-4 rounded-2xl border border-green-500 bg-[#0a0f1a]/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(80,192,64,0.35)]">
                    <AutoplayVideo
                      className="w-full aspect-video rounded-xl object-cover bg-black"
                      src={`${import.meta.env.BASE_URL}${product.video}`}
                      poster={`${import.meta.env.BASE_URL}${product.video.replace(
                        /\.mp4$/,
                        "-poster.jpg"
                      )}`}
                      controls={false}
                    />
                    {/* Same button as the landing page hero; opens `demoVideo`. */}
                    {product.demoVideo && (
                      <button
                        type="button"
                        onClick={() => setDemoOpen(true)}
                        className="absolute bottom-3 sm:bottom-10 left-1/2 z-10 -translate-x-1/2 inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-green-500 px-5 py-2.5 text-sm sm:text-base font-medium text-black transition-colors duration-300 hover:bg-green-400"
                      >
                        Learn more
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* The landing page's blurb for this product, when it is one of the
                suites shown there. Read from `combos` rather than copied, so the
                two places can never drift apart. */}
            {comboIntro && (
              <p className="max-w-4xl mx-auto mb-20 sm:mb-28 lg:mb-36 px-4 text-center text-sm sm:text-base lg:text-lg text-gray-400">
                {/* One sentence per line from sm up, where the column is wide
                    enough for a sentence to fill it. On a phone they stay
                    inline and run together as one paragraph, the way the
                    landing page sets them: a line per sentence there leaves
                    every other line half empty. The trailing space is what
                    separates them while inline, and collapses once the spans
                    turn into blocks. */}
                {comboIntro.map((line, idx) => (
                  <span key={idx} className="sm:block">
                    {line}
                    {idx < comboIntro.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
            )}
          </div>

          <div className="max-w-6xl mx-auto">

            {/* Headline numbers — investment, savings, time saved and ROI.
                Hidden for now: the figures are per-deal and not ready to be
                published on the product pages.
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {[
                { value: "RM300K", label: "Investment" },
                { value: product.savingsPerYear, label: "Saved Per Year" },
                { value: product.timeReduction, label: "Time Reduction" },
                { value: product.roi, label: "ROI Timeline" },
              ].map((stat) => (
                <div key={stat.label} className={`${cardClass} text-center`}>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            */}

            {/* No panel: the heading and copy sit straight on the page, in the
                landing page's section type — the treatment every section below
                repeats. */}
            <div className="mb-20 sm:mb-28 lg:mb-36 text-center">
              <h2 className="font-bold mb-3 sm:mb-4 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                {/* Named after the product, so the ZARA page reads "How ZARA
                    Works" and an agent's own page reads its agent name. A
                    product can override this with its own heading. */}
                {product.howItWorksTitle ||
                  `How ${product.heroTitle || product.name} Works`}
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-4xl mx-auto px-4">
                {product.aiRole}
              </p>
            </div>

            {/* Same treatment: no panel, landing page type. */}
            <div className="mb-20 sm:mb-28 lg:mb-36 text-center">
              <h2 className="font-bold mb-3 sm:mb-4 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                Problem Solved
              </h2>
              <div className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-4xl mx-auto px-4">
                {Array.isArray(product.problemSolved) ? (
                  product.problemSolved.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))
                ) : (
                  <p>{product.problemSolved}</p>
                )}
              </div>
            </div>

            {/* Same treatment: no panel, landing page type. */}
            <div className="mb-20 sm:mb-28 lg:mb-36 text-center">
              <h2 className="font-bold mb-3 sm:mb-4 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                Benefit
              </h2>
              {/* A product carries either one paragraph or a list of points.
                  The list gets the check marks and the left alignment of
                  Build for, and the extra top margin makes up the difference
                  between the paragraph heading gap and that section's. */}
              {Array.isArray(product.benefit) ? (
                <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 max-w-4xl mx-auto px-4 text-left">
                  {product.benefit.map((point, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-green-500 flex-shrink-0" />
                      <span className="text-sm sm:text-base lg:text-lg text-gray-400">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-4xl mx-auto px-4">
                  {product.benefit}
                </p>
              )}
            </div>

            {/* Same treatment: no panel, landing page type. */}
            <div className="mb-20 sm:mb-28 lg:mb-36">
              <h2 className="font-bold mb-6 sm:mb-8 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                Build For
              </h2>
              {/* A single left-aligned list, like Key Features below. */}
              <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto px-4">
                {product.targetUsers.map((user, idx) => (
                  <div key={idx} className="flex items-center">
                    {/* green-500 is the Learn more / Request a Demo button fill. */}
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base lg:text-lg text-gray-400">
                      {user}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Same treatment: no panel, landing page type. */}
            <div className="mb-20 sm:mb-28 lg:mb-36">
              <h2 className="font-bold mb-6 sm:mb-8 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                Key Features
              </h2>
              <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto px-4">
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start">
                    {/* A green sparkle per feature in place of the number badge. */}
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                    {/* A feature is either one line of copy, or a short name
                        with its own sentence under it. */}
                    {typeof feature === "string" ? (
                      <span className="text-sm sm:text-base lg:text-lg text-gray-400">
                        {feature}
                      </span>
                    ) : (
                      <span>
                        <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold">
                          {feature.title}
                        </span>
                        <span className="block text-sm sm:text-base lg:text-lg text-gray-400">
                          {feature.body}
                        </span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* The landing page's philosophy section, headings and all, so a
              reader who lands straight on a product still gets the sovereignty
              claim. Mirrors #philosophy in the landing tree below, down to its
              max-w-7xl: at the section column's narrower width the pillar
              headings wrap. A negative margin would widen it in place but
              overflows the page padding between lg and 1216px, so the column
              is closed and reopened around it instead. The headings are h2
              here because the hero owns the h1. */}
          <div className="max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-36">
            <h2 className="font-bold mb-2 sm:mb-3 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
              Your AI. Your Data. Your Infra.
            </h2>
            <h2 className="font-bold text-gray-400 mb-8 sm:mb-10 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
              Fully secure, sovereign and maximum control.
            </h2>
            <AioPillars />
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Closing call to action, with the site's green button pair. */}
            <div className="text-center">
              <h2 className="font-bold mb-3 sm:mb-4 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                Ready to Deploy {product.heroTitle || product.name}?
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-4xl mx-auto px-4">
                Truly helpful. Truly yours.
              </p>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-green-500 px-5 py-2.5 text-sm sm:text-base font-medium text-black transition-colors duration-300 hover:bg-green-400"
                >
                  Request a Demo
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => goHome()}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-green-500 px-5 py-2.5 text-sm sm:text-base font-medium text-white transition-colors duration-300 hover:bg-green-500/10"
                >
                  View All Systems
                </button>
              </div>
            </div>
          </div>

          <ScrollToTopButton />

          <div className="mt-16 sm:mt-20">
            <SiteFooter onNavigate={goHome} />
          </div>
        </div>
      </>
    );
  };

  const detailProduct =
    currentPage === "home"
      ? null
      : products.find((p) => p.id === currentPage) || null;

  if (detailProduct) {
    return (
      <>
        <SplashScreen key={splashRun} showMs={splashMs} onReveal={reveal} />
        {/* Mounted but hidden behind the splash, so the page is already laid
            out and its media already loading when the splash fades. */}
        <div className={revealed ? undefined : "invisible"}>
          <DetailPage product={detailProduct} />
        </div>
        {demoOpen && detailProduct.demoVideo && (
          <VideoModal
            src={`${import.meta.env.BASE_URL}${detailProduct.demoVideo}`}
            poster={`${import.meta.env.BASE_URL}${detailProduct.video.replace(
              /\.mp4$/,
              "-poster.jpg"
            )}`}
            label={`${detailProduct.heroTitle || detailProduct.name} demo`}
            onClose={() => setDemoOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <SplashScreen key={splashRun} showMs={splashMs} onReveal={reveal} />
      <div className={`stars ${revealed ? "" : "invisible"}`}></div>
      <div className={`nebula ${revealed ? "" : "invisible"}`}></div>
      {revealed && <SparkleField />}
      <div className={revealed ? undefined : "invisible"}>
        <SiteHeader onOpenPage={openSolutionPage} />
      </div>
      {/* pt-20 clears the 4rem/5rem top menu at every width. */}
      <div className={`min-h-screen text-white px-4 sm:px-6 lg:px-8 pt-20 pb-10 sm:pb-14 lg:pb-20 relative z-10 ${revealed ? "" : "invisible"}`}>
        <div className="max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-36">
          <div className="text-center mb-8">
            {/* HERO — locked to one viewport. Height budget (svh) keeps the
                title, subtitle and video fully visible without scrolling.
                min-h subtracts the page wrapper's top padding. */}
            <div className="flex flex-col items-center justify-center gap-[2.5svh] mb-8 landscape:min-h-[calc(100svh-5rem)]">
              <h1 className="relative flex items-center justify-center gap-[0.3em] px-4 font-extrabold text-center text-[min(12.5vw,clamp(1.75rem,6.4svh_+_0.6vw,4rem))] leading-[1.0625] tracking-[-0.009em]">
                {/* Brand mark — sized in em so it tracks the title's clamp. */}
                <AioLogo className="logo-glow h-[1.25em] w-[1.25em] shrink-0" />
                {/* <span className="absolute -top-1 -right-[0.55em] text-[0.32em] leading-none text-yellow-400 animate-pulse">
                  ✨
                </span> */}

                {/* Main text */}
                <span className="block">
                  <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]">
                    AI Office
                  </span>
                </span>
              </h1>

              <div className="max-w-4xl mx-auto text-center">
                <h1 className="font-bold text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                  Work{" "}
                  <RotatingWord
                    words={["SMARTER", "FASTER", "BETTER"]}
                    className="text-green-500"
                  />{" "}
                  with AI.
                </h1>
                <h1 className="font-bold text-gray-400 mt-[1svh] text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                  {getText("subtitle2")}
                </h1>
              </div>

              {/* Hero video — width derived from a height budget, so it can
                  never grow taller than the space left in the viewport. */}
              <div className="w-full flex justify-center px-4">
                <div className="group relative w-[min(100%,calc(50svh*16/9))] p-3 sm:p-4 rounded-2xl border border-green-500 bg-[#0a0f1a]/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(80,192,64,0.35)]">
                  <AutoplayVideo
                    className="w-full aspect-video rounded-xl object-cover bg-black"
                    src={`${import.meta.env.BASE_URL}hero-loop.mp4`}
                    poster={`${import.meta.env.BASE_URL}hero-poster.jpg`}
                    controls={false}
                  />
                  <button
                    type="button"
                    onClick={() => setDemoOpen(true)}
                    className="absolute bottom-3 sm:bottom-10 left-1/2 z-10 -translate-x-1/2 inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-green-500 px-5 py-2.5 text-sm sm:text-base font-medium text-black transition-colors duration-300 hover:bg-green-400"
                  >
                    Learn more
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm sm:text-base lg:text-lg text-gray-400 mt-2 max-w-4xl mx-auto px-4">
              AI Office Suite is your complete <span className="whitespace-nowrap">AI-Powered Workplace.</span>
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-gray-400 mt-2 max-w-6xl mx-auto px-4">
              Transform documents, data, knowledge base, and business processes with a unified suite of Artificial Intelligence applications.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-gray-400 mt-2 max-w-6xl mx-auto px-4">
              Built for organizations. Designed for productivity.{" "}
              {/* On phones the last sentence gets its own line, unbroken. */}
              <br className="sm:hidden" />
              <span className="whitespace-nowrap">Ready for on-premises AI.</span>
            </p>

            {/* <p className="text-sm sm:text-base lg:text-lg text-gray-400 mt-2 max-w-4xl mx-auto px-4">
              A modular AI operating system that powers plug-and-play AI agents to
              run standalone, as combined suites, or as a fully integrated
              ecosystem for internal operations and select client services.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-gray-400 mt-2 max-w-6xl mx-auto px-4">
              Enabling ministries to work smarter, respond faster and deliver
              trusted services fully secure, sustainable and sovereign.
            </p> */}

            {/* <p className="text-sm sm:text-base lg:text-lg text-gray-400 mt-2 px-4">{getText('statsLine')}</p> */}
            {/* <p className="text-sm sm:text-base lg:text-lg text-gray-400 mt-2 px-4 line-clamp-2 sm:line-clamp-none"> */}

            {/* <p className="text-sm sm:text-base lg:text-lg text-gray-400 mt-2 px-4 break-words">
              {getText("statsLine")}
            </p> */}
          </div>

          {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className={`${cardClass} text-center`}>
              <div className="text-3xl sm:text-4xl font-bold">12</div>
              <div className="text-xs sm:text-sm text-blue-200">
                {getText("aiSystems")}
              </div>
            </div>
            <div className={`${cardClass} text-center`}>
              <div className="text-3xl sm:text-4xl font-bold">70%</div>
              <div className="text-xs sm:text-sm text-green-200">
                {getText("avgTimeSaved")}
              </div>
            </div>
            <div className={`${cardClass} text-center`}>
              <div className="text-3xl sm:text-4xl font-bold">6-12</div>
              <div className="text-xs sm:text-sm text-purple-200">
                {getText("monthsROI")}
              </div>
            </div>
            <div className={`${cardClass} text-center`}>
              <div className="text-3xl sm:text-4xl font-bold">100%</div>
              <div className="text-xs sm:text-sm text-orange-200">
                {getText("dataSovereign")}
              </div>
            </div>
          </div> */}
        </div>

        <div id="philosophy" className="max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-36 scroll-mt-24 lg:scroll-mt-28">
          <h1 className="font-bold mb-2 sm:mb-3 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
            {/* ⚙️ TECH ARCHITECTURE */}
            Your AI. Your Data. Your Infra.
          </h1>
          <h1 className="font-bold text-gray-400 mb-8 sm:mb-10 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
            Fully secure, sovereign and maximum control.
          </h1>
          <AioPillars />
        </div>

        {/* Statement section */}
        <div className="max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-36">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-bold text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
              An Office with an Intelligent Workspace.
            </h2>
            <h2 className="font-bold text-gray-400 mt-2 sm:mt-3 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
              Get more done.{" "}
              {/* On phones the second sentence gets its own line, unbroken. */}
              <br className="sm:hidden" />
              <span className="whitespace-nowrap">Make better decisions.</span>
            </h2>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-36">
          <h2 className="font-bold mb-3 sm:mb-4 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
            Your AI assistant.
          </h2>
          <h2 className="font-bold text-gray-400 mb-14 sm:mb-20 lg:mb-24 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
            More personal. More powerful.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 sm:gap-10 lg:gap-16">
            {/* Only the first 2 combos render; AI Flash + AI Oracle remain in `combos`. */}
            {combos.slice(0, 2).map((combo) => (
              <div key={combo.id} id={combo.anchor} className="flex flex-col px-2 sm:px-4 scroll-mt-24 lg:scroll-mt-28">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 text-center">
                  {combo.name}
                </h3>
                <p className="grow mb-8 sm:mb-10 text-sm sm:text-base lg:text-lg text-gray-400 text-center">
                  {combo.effect.join(" ")}
                </p>

                {/* Green box wraps the video only — matches the hero video card */}
                <div className="group w-full p-4 sm:p-5 rounded-2xl border border-green-500 bg-[#0a0f1a]/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(80,192,64,0.35)]">
                  <AutoplayVideo
                    className="w-full aspect-video rounded-xl object-cover bg-black"
                    src={`${import.meta.env.BASE_URL}${combo.video}`}
                    poster={`${import.meta.env.BASE_URL}${combo.video.replace(
                      /\.mp4$/,
                      "-poster.jpg"
                    )}`}
                    controls={false}
                    disablePictureInPicture
                  />
                </div>

                {/* Combos without a `detailId` have no detail page yet, so their
                    button stays inert rather than routing to a missing product. */}
                <button
                  type="button"
                  onClick={() => {
                    if (combo.detailId) navigate(combo.detailId);
                  }}
                  className="mt-8 sm:mt-10 mx-auto inline-flex items-center gap-2 rounded-md bg-green-500 px-5 py-2.5 text-sm sm:text-base font-medium text-black transition-colors duration-300 hover:bg-green-400"
                >
                  Learn more
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder product sections — same layout as “Your AI assistant.” */}
        {productSections.map((section) => (
          <div
            key={section.id}
            className="max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-36"
          >
            <h2 className="font-bold mb-3 sm:mb-4 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
              {section.title}
            </h2>
            <h2 className="font-bold text-gray-400 mb-14 sm:mb-20 lg:mb-24 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
              {section.subtitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 sm:gap-10 lg:gap-16">
              {section.items.map((product) => (
                <div key={product.id} id={product.anchor} className="flex flex-col px-2 sm:px-4 scroll-mt-24 lg:scroll-mt-28">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 text-center">
                    {product.name}
                  </h3>
                  <p className="grow mb-8 sm:mb-10 text-sm sm:text-base lg:text-lg text-gray-400 text-center">
                    {product.description}
                  </p>

                  <div className="group w-full p-4 sm:p-5 rounded-2xl border border-green-500 bg-[#0a0f1a]/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(80,192,64,0.35)]">
                    {/* Items without a `video` or `image` fall back to the "coming soon" placeholder */}
                    {product.video ? (
                      <AutoplayVideo
                        className="w-full aspect-video rounded-xl object-cover bg-black"
                        src={`${import.meta.env.BASE_URL}${product.video}`}
                        // Posters sit beside each clip as <name>-poster.jpg, so
                        // they follow the `video` field instead of a second one.
                        poster={`${import.meta.env.BASE_URL}${product.video.replace(
                          /\.mp4$/,
                          "-poster.jpg"
                        )}`}
                        controls={false}
                        disablePictureInPicture
                      />
                    ) : product.image ? (
                      <img
                        className="w-full aspect-video rounded-xl object-cover bg-black"
                        src={`${import.meta.env.BASE_URL}${product.image}`}
                        alt={`${product.name} preview`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-video rounded-xl bg-black/60 border border-white/10 flex flex-col items-center justify-center gap-2 text-gray-500">
                        <Play className="w-10 h-10 sm:w-12 sm:h-12" />
                        <span className="text-xs sm:text-sm">Media coming soon</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="mt-8 sm:mt-10 mx-auto inline-flex items-center gap-2 rounded-md bg-green-500 px-5 py-2.5 text-sm sm:text-base font-medium text-black transition-colors duration-300 hover:bg-green-400"
                  >
                    Learn more
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* HIDDEN — flip `false` to `true` to restore the 12 AI Agents section */}
        {false && (
          <div className="max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-36">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-center px-4">
              12 {getText("aiSystems")}
            </h2>

            <p className="text-center text-sm sm:text-base text-gray-400 mb-10 sm:mb-12 px-4">
              Click any system to view full details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => {
                const Icon = product.icon;
                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(product.id)}
                    className={`${cardClass} cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">
                        {product.deployment}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm opacity-90 mb-3">
                      {product.power}
                    </p>
                    <div className="flex justify-between text-xs">
                      <div>
                        <div className="font-bold text-base sm:text-lg">
                          {product.timeReduction}
                        </div>
                        <div className="opacity-75 text-xs">Time Saved</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-base sm:text-lg">
                          {product.savingsPerYear}
                        </div>
                        <div className="opacity-75 text-xs">Saved/Year</div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 text-center">
                      <div className="text-red-500 text-xs sm:text-sm font-semibold hover:text-white transition-colors">
                        View Details →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* HIDDEN — flip `false` to `true` to restore the Deployment Strategies section */}
        {false && (
          <div className="max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-36">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-8 sm:mb-10 text-center px-4">
              DEPLOYMENT STRATEGIES
            </h2>
            {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"> */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {deploymentTiers.map((tier, idx) => (
                <div
                  key={tier.name}
                  // className={`rounded-lg p-4 sm:p-6 border-3 sm:border-4 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
                  // className={`rounded-lg p-4 sm:p-6 border sm:border-4 border-yellow-400 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
                  className={`${cardClass} cursor-pointer`}
                >
                  <div className="text-center mb-3 sm:mb-4">
                    <div
                      className={`text-xl sm:text-2xl font-bold mb-2 ${idx === 0
                        ? "text-orange-400"
                        : idx === 1
                          ? "text-gray-400"
                          : idx === 2
                            ? "text-amber-400"
                            : "text-blue-400"
                        }`}
                    >
                      {tier.name}
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                      {tier.cost}
                    </div>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-75">Agents:</span>
                      <span className="font-bold">{tier.systems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-75">Timeline:</span>
                      <span className="font-bold">{tier.timeline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-75">ROI:</span>
                      <span className="font-bold">{tier.roi}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        <div id="benefit" className="max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-36 scroll-mt-24 lg:scroll-mt-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 sm:gap-10 lg:gap-16">
            <div className="px-2 sm:px-4">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 flex items-center justify-center gap-2">
                <XCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 shrink-0" />
                Old Way
              </h3>
              <ul className="space-y-2 text-sm sm:text-base lg:text-lg text-gray-400 text-center">
                <li>• Expensive cloud subscriptions</li>
                <li>• Officers buried in paperwork</li>
                <li>• Policies lost in folders</li>
                <li>• Data in foreign servers</li>
                <li>• Clients waiting weeks</li>
                <li>• Fraud slipping through</li>
              </ul>
            </div>
            <div className="px-2 sm:px-4">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 flex items-center justify-center gap-2">
                {/* Brand mark in place of the check icon, sized in em so it
                    tracks the heading like the hero lockup does. */}
                <AioLogo className="logo-glow h-[1.25em] w-[1.25em] shrink-0" />
                <span className="relative inline-block font-extrabold tracking-[-0.009em]">
                  {/* <span className="absolute -top-0.5 -right-[0.55em] text-[0.4em] leading-none text-yellow-400 animate-pulse">
                    ✨
                  </span> */}
                  <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]">
                    AI Office
                  </span>
                </span>
              </h3>
              <ul className="space-y-2 text-sm sm:text-base lg:text-lg text-gray-400 text-center">
                <li>• Clients served in minutes</li>
                <li>• Fraud caught automatically</li>
                <li>• One Intelligent Workspace</li>
                <li>• AI handles routine work</li>
                <li>• Data stays in Malaysia</li>
                <li>• Instant policy recall</li>
              </ul>
            </div>
            <div className="px-2 sm:px-4">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 shrink-0" />
                Benefit
              </h3>
              <ul className="space-y-2 text-sm sm:text-base lg:text-lg text-gray-400 text-center">
                <li>• Each works 24/7/365 without fatigue</li>
                <li>• Work Smarter and better decisions</li>
                <li>• All sovereign. All secure. All yours.</li>
                <li>• Automate repetitive work faster</li>
                <li>• All speak Malay and English</li>
                <li>• Each gets smarter with use</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Floating Scroll to Top Button */}
        <ScrollToTopButton />

        {/* Footer Section */}
        <SiteFooter />
      </div>

      {demoOpen && (
        <VideoModal
          src={`${import.meta.env.BASE_URL}hero-720.mp4`}
          poster={`${import.meta.env.BASE_URL}hero-poster.jpg`}
          label="AI Office Suite demo"
          onClose={() => setDemoOpen(false)}
        />
      )}
    </>
  );
};

export default AIArsenalDashboard;
