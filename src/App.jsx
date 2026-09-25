import React, { useCallback, useEffect, useRef, useState } from "react";
import SparkleField from "./components/SparkleField";
import AutoplayVideo from "./components/AutoplayVideo";
import HeroArt from "./components/HeroArt";
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

// Every page's splash shows ZARA holding the AIO mark (the About hero art).
// The logo-disc splash it replaced is kept in SplashScreen.backup.jsx.
const SPLASH_ART = `${import.meta.env.BASE_URL}about-hero.webp`;

// Vanity URL slugs for each detail page's `products` id, e.g. aioffice.com.my/zara.
// 4 matches the "zara" top-menu anchor (see `combos` below); keep the two in
// sync if it ever changes. 7 and 13 intentionally differ from their
// "zara-agent" and "form-filler" top-menu anchors.
const PRODUCT_SLUGS = {
  1: "ai-policy-agent",
  2: "ai-legal-agent",
  3: "ai-document-agent",
  4: "zara",
  5: "ai-permit-agent",
  6: "ai-write-agent",
  7: "aio-agent",
  8: "ai-fraudguard-agent",
  9: "ai-inspector-agent",
  10: "ai-budget-agent",
  11: "ai-forecast-agent",
  12: "ai-insight-agent",
  13: "aio-form",
  14: "aio-verify",
  15: "aio-insight",
  16: "aio-forecast",
  17: "aio-lab",
  // 18 is the backup About page, hidden: no slug, so no URL reaches it.
  19: "about",
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
  // Default is the site's original dark theme; the header toggle switches to
  // a light theme, driven entirely by the `data-theme` attribute on <html>
  // (see index.css) so plain CSS overrides handle every component.
  const [theme, setTheme] = useState(
    () => localStorage.getItem("aio-theme") || "dark"
  );
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("aio-theme", theme);
  }, [theme]);
  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );
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

  // The landing page's own menu links: every one of them targets a section of
  // the page already on screen, so the scroll is done here instead of being
  // left to the browser's hash jump. That keeps the address bar on the clean
  // pathname the router reads, and lands the same way as the detail pages do.
  const scrollToSection = useCallback((href) => {
    if (!href || href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // The mobile panel closes in the same click, so the scroll waits a frame
    // for that layout to settle before it measures the section.
    requestAnimationFrame(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

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
      subtitle2: "Smart. Helpful. Yours.",
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
      // Overrides the closing "Ready to Deploy ZARA?" line below.
      ctaTagline: "Chat. Know. Done.",
      // Overrides the "How ZARA Works" default heading below. "Assistant" is
      // struck through in green, so this is JSX rather than a plain string:
      // `decoration-` colours and thickens the line without tinting the word.
      howItWorksTitle: (
        <>
          Your AI{" "}
          <s className="decoration-green-500 decoration-[0.14em]">Assistant</s>{" "}
          Buddy
        </>
      ),
      // This page's own headline stack, in place of the shared
      // "Work SMART with AI." / "Smart. Helpful. Yours." pair.
      hero: {
        lead: "More",
        words: ["PERSONAL", "TRUSTED", "RELEVANT"],
        tail: " with AI.",
        subtitle: "Chat. Know. Done.",
      },
      category: "Client Interface",
      power: "24/7 client service",
      savingsPerYear: "RM400K",
      timeReduction: "50%",
      color: "from-green-500 to-green-600",
      deployment: "Standalone",
      // The combo card's intro paragraph stays on the landing page only.
      hideHeroIntro: true,
      // Each subtitle sits on its own line at the Key Features title size, so
      // these three are JSX rather than plain strings. `aiRole` renders under
      // the "Your AI Assistant Buddy" heading.
      aiRole: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Meet ZARA (ZEN Artificial Reasoning Assistant).
          </span>
          Chat naturally with ZARA to find information, get answers,
          understand procedures, and access your organization’s knowledge.
        </>
      ),
      challenge: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Finding information shouldn’t be hard.
          </span>
          Employees often spend time searching through documents, systems, and
          messages just to find a simple answer.
        </>
      ),
      // Overrides the "Problem Solved" heading; as on the AIO Verify page,
      // there's no separate Benefit section.
      problemSolvedTitle: "Benefits",
      problemSolved: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Ask less. Find faster.
          </span>
          Get quick, consistent answers while reducing repetitive questions and
          helping employees get the information they need.
        </>
      ),
      targetUsers: [
        "Employees",
        "HR & Administration",
        "Managers",
        "Customer Service Teams",
        "Organizations",
      ],
      features: [
        {
          title: "Natural Conversation",
          body: "Ask questions in your own words.",
        },
        {
          title: "Organizational Knowledge",
          body: "Get answers from your organization’s information.",
        },
        {
          title: "24/7 Availability",
          body: "Get help whenever you need it.",
        },
        {
          title: "Malay & English",
          body: "Communicate naturally in both languages.",
        },
        {
          title: "Context-Aware",
          body: "Understands the conversation.",
        },
        {
          title: "Secure On-Premise AI",
          body: "Keep your information within your environment.",
        },
      ],
      useCases: {
        subtitle: "Built for smarter, simpler everyday work.",
        items: [
          {
            title: "HR & Employee Services",
            body: "“Check my leave balance.” Get answers and complete everyday HR enquiries through chat.",
          },
          {
            title: "Company Knowledge",
            body: "“Where can I find the latest HR policy?” Find the right information without searching through documents.",
          },
          {
            title: "Staff Support",
            body: "“How do I apply for medical leave?” Get clear, instant guidance whenever help is needed.",
          },
          {
            title: "Management Support",
            body: "“What’s our leave policy for this situation?” Get quick access to relevant company information.",
          },
        ],
      },
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
      video: "zara-promo.mp4",
      // No dedicated demo clip for this page yet, so "Learn more" opens the
      // landing page's own full hero video (with sound) instead of the
      // silent zara-promo loop — swap for a real ZARA x AIO Agent demo once
      // one exists.
      demoVideo: "hero-720.mp4",
      heroTitle: "ZARA x AIO Agent",
      // Stacks the hero's brand heading onto its own line per word instead of
      // letting the browser wrap "ZARA x AIO Agent" wherever it runs out of
      // room; the logo then sits beside "ZARA" only, not the whole title.
      heroTitleLines: ["ZARA", "x", "AIO Agent"],
      howItWorksTitle: "How It Works",
      // This page's own headline stack, in place of the shared
      // "Work SMART with AI." / "Smart. Helpful. Yours." pair.
      hero: {
        lead: "More",
        words: ["HELPFUL", "POWERFUL", "EASY"],
        tail: " with AI.",
        subtitle: "Chat. Act. Done.",
      },
      category: "Defense Systems",
      power: "Spots bad deals early",
      savingsPerYear: "RM450K",
      timeReduction: "80%",
      color: "from-violet-500 to-violet-600",
      deployment: "Stackable",
      // The combo card's intro paragraph stays on the landing page only.
      hideHeroIntro: true,
      // Each subtitle sits on its own line at the Key Features title size, so
      // these three are JSX rather than plain strings.
      aiRole: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Tell ZARA what you need.
          </span>
          Extend ZARA with AIO Agent and turns your request into action by
          helping complete tasks directly through chat and working with your
          organization’s existing systems.
        </>
      ),
      challenge: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Too many forms. Too many systems.
          </span>
          Simple tasks can require multiple steps, forms, and systems. ZARA x
          AIO Agent brings them together through conversation.
        </>
      ),
      // Overrides the "Problem Solved" heading; as on the AIO Verify page,
      // there's no separate Benefit section.
      problemSolvedTitle: "Benefits",
      problemSolved: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Skip the steps. Get it done.
          </span>
          Complete everyday tasks faster, reduce repetitive work, and make
          existing systems easier to use.
        </>
      ),
      targetUsers: [
        "Employees",
        "Managers",
        "HR & Administration",
        "Customer Service Teams",
        "Organizations",
      ],
      features: [
        {
          title: "Chat to Get Things Done",
          body: "Tell ZARA what you need.",
        },
        {
          title: "Task Completion",
          body: "Complete supported tasks through chat.",
        },
        {
          title: "No More Forms",
          body: "Reduce manual form filling.",
        },
        {
          title: "Works with Existing Systems",
          body: "Connect with your organization’s systems.",
        },
        {
          title: "Simple to Use",
          body: "No technical knowledge required.",
        },
        {
          title: "Available 24/7",
          body: "Get assistance anytime.",
        },
      ],
      useCases: {
        subtitle: "Built for simpler, faster everyday tasks.",
        items: [
          {
            title: "Employee Services",
            body: "Apply for leave, check balances, and complete HR tasks through chat.",
          },
          {
            title: "Government Services",
            body: "Submit applications and requests without switching between systems.",
          },
          {
            title: "Customer Services",
            body: "Handle requests and submissions directly through a simple conversation.",
          },
          {
            title: "Business Operations",
            body: "Turn routine requests into completed tasks with fewer steps.",
          },
        ],
      },
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
    {
      // Landing-page product, not one of the 12 AI Agents — its "Learn more"
      // button (see `productSections` below) opens this page.
      id: 13,
      name: "AIO Form",
      video: "aio-form-filler-loop.mp4",
      demoVideo: "aio-form-filler.mp4",
      // Overrides the closing "Ready to Deploy AIO Form?" line below.
      ctaTagline: "Classify. Extract. Fill.",
      howItWorksTitle: "How It Works",
      // This page's own headline stack, in place of the shared
      // "Work SMART with AI." / "Smart. Helpful. Yours." pair.
      hero: {
        lead: "Less",
        words: ["TYPING", "HASSLE", "MISTAKES"],
        tail: " with AI.",
        subtitle: "Classify. Extract. Fill.",
      },
      // Each subtitle sits on its own line at the Key Features title size, so
      // these three are JSX rather than plain strings.
      aiRole: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            From documents to ready.
          </span>
          AIO Form identifies the application type, extracts the required
          information from submitted documents, and fills the relevant form
          fields automatically.
        </>
      ),
      challenge: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Too much typing. Too much manual work.
          </span>
          Application processing often means finding the right form, reading
          documents, and entering information field by field.
        </>
      ),
      // Overrides the "Problem Solved" heading; as on the AIO Verify page,
      // there's no separate Benefit section.
      problemSolvedTitle: "Benefits",
      problemSolved: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Less typing. Less hassle. Fewer mistakes with AI.
          </span>
          Reduce manual data entry, speed up applications, and make the
          submission process simpler for everyone.
        </>
      ),
      targetUsers: [
        "Government Agencies",
        "Corporate Organizations",
        "HR & Administration",
        "Customer Service Teams",
        "Application Processing Centers",
        "Public Service Departments",
      ],
      features: [
        {
          title: "Application Recognition",
          body: "Identify the right application.",
        },
        {
          title: "Information Extraction",
          body: "Capture details from documents and images.",
        },
        {
          title: "Handwriting Recognition",
          body: "Read handwritten information.",
        },
        {
          title: "Automatic Form Filling",
          body: "Populate the required fields.",
        },
        {
          title: "Faster Processing",
          body: "Move applications forward faster.",
        },
        {
          title: "Less Manual Work",
          body: "Reduce repetitive data entry.",
        },
      ],
      useCases: {
        subtitle: "Make every application faster.",
        items: [
          {
            title: "Government Applications",
            body: "Identify the right form and capture applicant information automatically.",
          },
          {
            title: "HR & Employee Forms",
            body: "Extract employee details and reduce repetitive data entry.",
          },
          {
            title: "Customer Applications",
            body: "Process application information faster with automated form filling.",
          },
          {
            title: "Service Counters",
            body: "Turn documents and handwriting into ready-to-process forms.",
          },
        ],
      },
    },
    {
      // Landing-page product, not one of the 12 AI Agents — its "Learn more"
      // button (see `productSections` below) opens this page.
      id: 14,
      name: "AIO Verify",
      // Temporary: an animated still of ZARA with the AIO mark stands in for
      // the video and demo until new footage is ready. With no `demoVideo`,
      // the hero has no "Learn more" button.
      image: "aio-verify-zara.webp",
      ctaTagline: "Match. Verified. Confirm.",
      howItWorksTitle: "How It Works",
      hero: {
        lead: "Less",
        words: ["CHECKING", "HASSLE", "MISTAKES"],
        tail: " with AI.",
        subtitle: "Match. Verified. Confirm.",
      },
      // Each subtitle sits on its own line at the Key Features title size, so
      // these three are JSX rather than plain strings.
      aiRole: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Check every detail. Automatically.
          </span>
          AIO Verify compares application information with supporting
          documents, identifies missing details and mismatches, and highlights
          what needs attention.
        </>
      ),
      challenge: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Too much checking. Too many details.
          </span>
          Manually comparing forms and documents takes time and makes it easy
          to miss important information.
        </>
      ),
      // Overrides the "Problem Solved" heading.
      problemSolvedTitle: "Benefit",
      problemSolved: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Faster checks. Fewer mistakes.
          </span>
          AIO Verify automatically compares application details with supporting
          documents, highlighting missing information and mismatches—so your
          team can review applications faster and with greater confidence.
        </>
      ),
      targetUsers: [
        "Government Agencies",
        "Corporate Organizations",
        "HR & Administration",
        "Customer Service Teams",
        "Application Processing Centers",
        "Public Service Departments",
      ],
      features: [
        {
          title: "Smart Matching",
          body: "Compare application details with supporting documents.",
        },
        {
          title: "Mismatch Detection",
          body: "Highlight information that does not match.",
        },
        {
          title: "Missing Information",
          body: "Identify missing details and documents.",
        },
        {
          title: "Easy Review",
          body: "Quickly see what needs attention.",
        },
        {
          title: "Faster Verification",
          body: "Reduce repetitive manual checking.",
        },
        {
          title: "Consistent Checking",
          body: "Support a consistent verification process.",
        },
      ],
      // Hidden for now: the Problem Solved copy runs under a "Benefit"
      // heading instead (`problemSolvedTitle`). Uncomment to bring it back.
      // benefit: (
      //   <>
      //     <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
      //       Verify faster. Process with confidence.
      //     </span>
      //     Reduce manual checking, catch mismatches earlier, and keep
      //     applications moving.
      //   </>
      // ),
      useCases: {
        subtitle: "Built for faster, simpler verification.",
        items: [
          {
            title: "Government Applications",
            body: "Match applications with supporting documents. Spot missing details instantly.",
          },
          {
            title: "HR & Employee Records",
            body: "Verify employee information. Keep records complete and accurate.",
          },
          {
            title: "Customer Applications",
            body: "Check applications at scale. Find mismatches before they become problems.",
          },
        ],
      },
    },
    {
      // Landing-page product, not one of the 12 AI Agents — its "Learn more"
      // button (see `productSections` below) opens this page.
      id: 15,
      name: "AIO Insight",
      // The clip the landing card already uses, standing in until this
      // product has media of its own.
      video: "aio-insight-loop.mp4",
      demoVideo: "aio-insight.mp4",
      ctaTagline: "Analyze. Visualize. Decide.",
      howItWorksTitle: "How It Works",
      hero: {
        lead: "Gain",
        words: ["CLARITY", "PERSPECTIVE", "KNOWLEDGE"],
        tail: " with AI.",
        subtitle: "Analyze. Visualize. Decide.",
      },
      // Each subtitle sits on its own line at the Key Features title size, so
      // these three are JSX rather than plain strings.
      aiRole: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Turn data into understanding.
          </span>
          AIO Insight transforms your data into clear visuals and meaningful
          insights, helping you discover trends, patterns, and opportunities.
        </>
      ),
      challenge: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Too much data. Not enough clarity.
          </span>
          Important information can be buried in spreadsheets, reports, and
          datasets, making it difficult to see what really matters.
        </>
      ),
      // Overrides the "Problem Solved" heading; as on the AIO Verify page,
      // there's no separate Benefit section.
      problemSolvedTitle: "Benefits",
      problemSolved: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Gain clarity. Perspective. Knowledge with AI.
          </span>
          Understand your data faster, uncover meaningful patterns, and make
          better-informed decisions.
        </>
      ),
      targetUsers: [
        "Management Teams",
        "Business Analysts",
        "Government Agencies",
        "Corporate Organizations",
        "Finance & Operations Teams",
        "Data Teams",
      ],
      features: [
        {
          title: "Data Analysis",
          body: "Understand what your data is telling you.",
        },
        {
          title: "Visual Insights",
          body: "Turn data into easy-to-understand visuals.",
        },
        {
          title: "Trend Detection",
          body: "Identify important changes and patterns.",
        },
        {
          title: "Data Exploration",
          body: "Ask questions and explore your data.",
        },
        {
          title: "Reports & Summaries",
          body: "Turn complex data into clear information.",
        },
        {
          title: "Decision Support",
          body: "Get insights that support better decisions.",
        },
      ],
      useCases: {
        subtitle: "Built for smarter decisions.",
        items: [
          {
            title: "Business Performance",
            body: "Analyze sales, revenue, and operational data to understand what is happening.",
          },
          {
            title: "Government Analytics",
            body: "Explore large datasets to identify trends, patterns, and areas that need attention.",
          },
          {
            title: "Finance & Operations",
            body: "Monitor performance, compare results, and uncover opportunities for improvement.",
          },
        ],
      },
    },
    {
      // Landing-page product, not one of the 12 AI Agents — its "Learn more"
      // button (see `productSections` below) opens this page.
      id: 16,
      name: "AIO Forecast",
      // Shares AIO Insight's clip, same as the landing card does, until this
      // product has media of its own.
      video: "aio-insight-loop.mp4",
      demoVideo: "aio-insight.mp4",
      ctaTagline: "Predict. Plan. Prepare.",
      howItWorksTitle: "How It Works",
      hero: {
        lead: "Gain",
        words: ["FORESIGHT", "CLARITY", "DIRECTION"],
        tail: " with AI.",
        subtitle: "Predict. Plan. Prepare.",
      },
      // Each subtitle sits on its own line at the Key Features title size, so
      // these three are JSX rather than plain strings.
      aiRole: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Turn data into foresight.
          </span>
          AIO Forecast uses historical and current data to identify trends and
          provide forward-looking forecasts that help you plan ahead.
        </>
      ),
      challenge: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            The future is uncertain. Data can help.
          </span>
          Planning without understanding future trends can make it harder to
          prepare for changing demand, resources, and business conditions.
        </>
      ),
      // Overrides the "Problem Solved" heading; as on the AIO Verify page,
      // there's no separate Benefit section.
      problemSolvedTitle: "Benefits",
      problemSolved: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Gain foresight. Direction. Perspective with AI.
          </span>
          Anticipate trends, prepare for what may come, and make more informed
          plans using your data.
        </>
      ),
      targetUsers: [
        "Management Teams",
        "Business Analysts",
        "Government Agencies",
        "Corporate Organizations",
        "Finance & Operations Teams",
        "Planning Teams",
      ],
      features: [
        {
          title: "Trend Forecasting",
          body: "Identify potential future trends.",
        },
        {
          title: "Data-Based Predictions",
          body: "Use historical data to support forecasts.",
        },
        {
          title: "Demand Planning",
          body: "Better understand future needs.",
        },
        {
          title: "Scenario Exploration",
          body: "Explore possible outcomes.",
        },
        {
          title: "Visual Forecasts",
          body: "Make future trends easier to understand.",
        },
        {
          title: "Planning Support",
          body: "Turn forecasts into better preparation.",
        },
      ],
      useCases: {
        subtitle: "Built for smarter planning ahead.",
        items: [
          {
            title: "Sales & Demand",
            body: "Forecast future demand from historical sales data. Plan inventory with greater confidence.",
          },
          {
            title: "Finance & Budgeting",
            body: "Project future revenue and expenses. Support more informed financial planning.",
          },
          {
            title: "Operations & Capacity",
            body: "Anticipate future workload and resource needs. Plan capacity before demand arrives.",
          },
          {
            title: "Government Planning",
            body: "Analyze historical trends to support future planning, budgeting, and resource allocation.",
          },
        ],
      },
    },
    {
      // Landing-page product, not one of the 12 AI Agents — its "Learn more"
      // button (see `productSections` below) opens this page.
      id: 17,
      name: "AIO Lab",
      // A still rather than a clip, same as the landing card.
      image: "gb10.webp",
      ctaTagline: "Learn. Build. Innovate.",
      howItWorksTitle: "How It Works",
      hero: {
        lead: "Build",
        words: ["SKILLS", "KNOWLEDGE", "SOLUTIONS"],
        tail: " with AI.",
        subtitle: "Learn. Build. Innovate.",
      },
      // Each subtitle sits on its own line at the Key Features title size, so
      // these three are JSX rather than plain strings.
      aiRole: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Learn by building.
          </span>
          AIO Lab provides a hands-on environment to explore AI, experiment
          with ideas, develop solutions, and turn concepts into working
          projects.
        </>
      ),
      challenge: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Learning AI shouldn’t stop at theory.
          </span>
          Understanding AI requires practical experience. Teams need a safe
          environment to experiment, build, test, and learn.
        </>
      ),
      // Overrides the "Problem Solved" heading; as on the AIO Verify page,
      // there's no separate Benefit section.
      problemSolvedTitle: "Benefits",
      problemSolved: (
        <>
          <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Build skills. Explore ideas. Create with AI.
          </span>
          Give teams a practical space to develop AI skills, experiment with
          new ideas, and turn learning into real solutions.
        </>
      ),
      targetUsers: [
        "Students",
        "Educators",
        "Developers",
        "Innovation Teams",
        "AI Teams",
        "Organizations",
      ],
      features: [
        {
          title: "Hands-On Learning",
          body: "Learn AI through practical projects.",
        },
        {
          title: "Experimentation",
          body: "Explore ideas in a safe environment.",
        },
        {
          title: "AI Development",
          body: "Build and test AI solutions.",
        },
        {
          title: "Project-Based Learning",
          body: "Turn concepts into working projects.",
        },
        {
          title: "Team Collaboration",
          body: "Learn and build together.",
        },
        {
          title: "Innovation Space",
          body: "Experiment with what’s possible.",
        },
      ],
      useCases: {
        subtitle: "Built for hands-on AI learning and innovation.",
        items: [
          {
            title: "AI Training",
            body: "Learn AI through practical exercises and real-world projects.",
          },
          {
            title: "AI Development",
            body: "Build and test AI solutions in a hands-on environment.",
          },
          {
            title: "AI Research",
            body: "Experiment with models, tools, and new AI applications.",
          },
          {
            title: "AI Infrastructure",
            body: "Deploy and manage AI workloads on dedicated local hardware.",
          },
          {
            title: "AI Lab Setup",
            body: "Create a dedicated environment for training, development, testing, and experimentation.",
          },
        ],
      },
    },
    {
      // Backup of the previous About page, hidden for now: nothing links to
      // it and it has no URL slug. It borrows the AIO Form page's layout.
      id: 18,
      name: "About (backup)",
      video: "hero-loop.mp4",
      demoVideo: "hero-720.mp4",
      hero: {
        lead: "Lorem",
        words: ["IPSUM", "DOLOR", "AMET"],
        tail: " sit amet.",
        subtitle: "Lorem. Ipsum. Dolor.",
      },
      // Everything below the hero video: this list replaces the product
      // sections, the architecture block and the closing call to action.
      // A `body` entry is a paragraph, or an array of lines kept one per line.
      aboutSections: [
        {
          title: "AI Office",
          subtitle: "Work Smart.",
          body: [
            "Work is changing.",
            "AI Office brings intelligent tools into the way you already work—helping you find answers, complete tasks, work with documents, understand data, and build new solutions.",
          ],
          tagline: "Simple to use. Powerful to have.",
        },
        {
          title: "AI That Gets Things Done",
          subtitle: "Don't just ask. Get things done.",
          body: [
            "From a simple question to a completed task, AI Office turns everyday work into something simpler.",
          ],
          tagline: "Chat. Act. Analyze. Build.",
        },
        {
          title: "Your AI. Your Data. Your Infra.",
          subtitle: "Because your work belongs to you.",
          body: [
            "AI Office is designed for private, secure deployment within your own infrastructure.",
            [
              "Your data stays yours.",
              "Your systems stay yours.",
              "Your AI works where you need it.",
            ],
          ],
        },
        {
          title: "Everything You Need. In One Place.",
          subtitle: "One workplace. A smarter way to work.",
          body: [
            "AI Office brings together AI buddies, AI agents, document automation, data intelligence, forecasting, and software development—all designed to work together.",
          ],
        },
        {
          title: "Built for What Comes Next",
          subtitle: "Work smart today. Build what's next.",
          body: [
            "AI Office gives organizations the tools to work smarter, move faster, and create new possibilities with AI.",
          ],
        },
      ],
      // Closing line, in the place of "Ready to Deploy …?".
      aboutClosing: "AI Office. Work Smart.",
    },
    {
      // The About page, reached from the About links in the top menu and the
      // footer. An illustration takes the place of the hero headline and
      // video; below it, the same layout as the backup About page above.
      id: 19,
      name: "About",
      heroArt: "about-hero.webp",
      aboutSections: [
        {
          title: "AI Office",
          subtitle: "Work Smart.",
          body: [
            "Work should be smart.",
            ["Less searching.", "Less switching.", "Less repeating."],
            ["More doing.", "More creating.", "More time for what matters."],
          ],
          tagline: "That’s AI Office.",
        },
        {
          title: "AI That Works With You",
          subtitle: "Not just answers. Action.",
          body: [
            "AI Office brings AI into everyday work.",
            [
              "Find information.",
              "Complete tasks.",
              "Process documents.",
              "Understand data.",
              "Build software.",
            ],
          ],
          tagline: "Everything you need to work smart.",
        },
        {
          title: "Made for Your Workplace",
          subtitle: "Your work. Your way.",
          body: [
            "AI Office is built for organizations that want AI closer to their people, their systems, and their data.",
            "From government agencies to enterprise teams, AI Office fits into the way you already work.",
          ],
          tagline: ["No need to change everything.", "Just work smart."],
        },
        {
          title: "Your AI. Your Data. Your Infra.",
          subtitle: "Because your work belongs to you.",
          body: [
            "Run AI on your own infrastructure.",
            [
              "Keep your data where you want it.",
              "Keep your systems under your control.",
              "Keep your AI working for you.",
            ],
          ],
          tagline: "Private. Secure. Yours.",
        },
        {
          title: "One Suite. Many Ways to Work.",
          subtitle: "Everything works together.",
          items: [
            {
              title: "ZARA AI Buddy",
              tagline: "Chat. Know. Done.",
              body: "Get answers and company knowledge through a simple conversation.",
            },
            {
              title: "ZARA x AIO Agent",
              tagline: "Chat. Act. Done.",
              body: "Turn conversations into completed tasks.",
            },
            {
              title: "AIO Form",
              tagline: "Classify. Extract. Fill.",
              body: "Turn applications and documents into ready-to-process information.",
            },
            {
              title: "AIO Verify",
              tagline: "Verified. Match. Confirm.",
              body: "Check applications against supporting documents.",
            },
            {
              title: "AIO Insight",
              tagline: "Analyze. Visualize. Decide.",
              body: "Turn data into clear insights.",
            },
            {
              title: "AIO Forecast",
              tagline: "Predict. Plan. Prepare.",
              body: "See what may come next and plan ahead.",
            },
            {
              title: "AIO Lab",
              tagline: "Learn. Build. Innovate.",
              body: "Learn AI by experimenting, building, and doing.",
            },
            {
              title: "AIO Code",
              tagline: "Code. Build. Ship.",
              body: "Build software faster, from code to delivery.",
            },
          ],
          tagline: ["One suite.", "One workplace.", "One smart way to work."],
        },
        {
          title: "Built by Zen Computer Systems",
          subtitle: "Technology that works where it matters.",
          body: [
            <>
              AI Office is developed by{" "}
              <strong className="font-bold text-white">
                Zen Computer Systems Artifical Intelligent Office (AIO)
                department
              </strong>
              , a Malaysian technology company building software, AI, and digital
              solutions for government and enterprise organizations.
            </>,
            "We believe technology should be useful, practical, and built for the real world.",
          ],
          tagline: "That belief is built into AI Office.",
        },
        {
          title: "Built for What’s Next",
          subtitle: "Start with AI. Grow with it.",
          body: [
            "AI is changing how we work.",
            "AI Office gives organizations a foundation to start today—and keep building tomorrow.",
            ["New tools.", "New capabilities.", "New ways to work."],
          ],
          tagline: ["Work Smart.", "Today and tomorrow."],
        },
      ],
      aboutClosing: "AI Office",
      aboutClosingSubtitle: "Work Smart.",
    },
  ];

  // Placeholder product sections — replace title/subtitle/name/description,
  // then add a `video` field to an item once its media is ready.
  const productSections = [
    {
      id: "documents",
      title: "AI Application Processing.",
      subtitle: "Streamline your application submissions process.",
      items: [
        {
          id: "product1",
          anchor: "form-filler", // top menu link target
          name: "AIO Form",
          video: "aio-form-filler-loop.mp4",
          tagline: "Classify. Extract. Fill.",
          description: [
            "Simplify application submissions with AI that identifies the right form, extracts information from your documents, and fills it for you.",
          ],
          outro: "Less typing. Less hassle. Fewer mistakes with AI.",
          // "Learn more" opens this `products` entry's detail page.
          detailId: 13,
        },
        {
          id: "product2",
          anchor: "form-checker", // top menu link target
          name: "AIO Verify",
          // Temporary still, same as its detail page's hero.
          image: "aio-verify-zara.webp",
          // "Learn more" opens this `products` entry's detail page.
          detailId: 14,
          tagline: "Verified. Match. Confirm.",
          description: [
            "Check application details against supporting documents and quickly identify missing or mismatched information.",
          ],
          outro: "Faster checks. Clearer results. Smoother processing.",
        },
      ],
    },
    {
      id: "forecast",
      title: "AI Data Intelligence.",
      subtitle: "Turn local data into answers.",
      items: [
        {
          id: "product9",
          anchor: "insight", // top menu link target
          // "Learn more" opens this `products` entry’s detail page.
          detailId: 15,
          name: "AIO Insight",
          video: "aio-insight-loop.mp4",
          tagline: "Analyze. Visualize. Decide.",
          description: [
            "Turn your data into clear insights with AI that helps you understand trends, uncover patterns, and make informed decisions.",
          ],
          outro: "Gain clarity. Perspective. Knowledge with AI.",
        },
        {
          id: "product10",
          anchor: "forecast", // top menu link target
          // "Learn more" opens this `products` entry’s detail page.
          detailId: 16,
          name: "AIO Forecast",
          video: "aio-insight-loop.mp4",
          tagline: "Predict. Plan. Prepare.",
          description: [
            "Look ahead with AI-powered forecasting that helps understand trends, anticipate what comes next, and plan with greater clarity.",
          ],
          outro: "Gain foresight. Direction. Perspective with AI.",
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
      title: "AI Local Development.",
      subtitle: "Build and learn in house for education and internal teams.",
      items: [
        {
          id: "product7",
          anchor: "lab", // top menu link target
          // "Learn more" opens this `products` entry’s detail page.
          detailId: 17,
          name: "AIO Lab",
          image: "gb10.webp",
          tagline: "Learn. Build. Innovate.",
          description: [
            "A hands-on AI environment for learning, experimentation, development, and turning ideas into working solutions.",
          ],
          outro: "Build skills. Explore ideas. Create with AI.",
        },
        {
          id: "product8",
          anchor: "code", // top menu link target
          name: "AIO Code",
          image: "aiocode.jpg",
          tagline: "Code. Build. Ship.",
          description: [
            "AI-powered workspace to manage the full SDLC—from coding and tickets to testing and progress tracking—all in one place.",
          ],
          outro: "From code to delivery. One workspace.",
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
      // Landing card copy: a tagline under the name, the paragraph, then a
      // closing line. (The detail page sets `hideHeroIntro`, so none of this
      // shows there.)
      tagline: "Chat. Know. Done.",
      effect: [
        "Your everyday AI buddy for finding information, getting answers, and getting help — securely within your organization.",
      ],
      outro: "Ask. Understand. Get things done.",
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
      // Same card layout as ZARA: tagline, paragraph, closing line. (The
      // detail page sets `hideHeroIntro`, so none of this shows there.)
      tagline: "Chat. Act. Done.",
      effect: [
        "Turn conversations into action. Tell ZARA what you need and let it help complete tasks directly through chat.",
      ],
      outro: "No forms. No switching. Just ask.",
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

  // The top menu's ZARA entry (and any other product with its own detail
  // page) opens that page rather than scrolling to its landing section. The
  // href is the section anchor, so whichever combo or product owns that
  // anchor is what says which page to open.
  const openSolutionPage = (href) => {
    // The About pages have no landing section to own their hrefs.
    const aboutPage = { "#about": 19 }[href];
    if (aboutPage) {
      navigate(aboutPage);
      return;
    }
    const anchored = [
      ...combos,
      ...productSections.flatMap((section) => section.items),
    ];
    const detailId = anchored.find((c) => c.anchor && `#${c.anchor}` === href)
      ?.detailId;
    if (detailId) navigate(detailId);
  };

  // An About page copy entry is a string (or JSX), or an array of lines kept
  // one per line.
  const aboutLines = (text) =>
    Array.isArray(text)
      ? text.map((line, idx) => (
          <span key={idx} className="block">
            {line}
          </span>
        ))
      : text;

  const DetailPage = ({ product }) => {
    // Suites on the landing page carry an intro paragraph; a standalone
    // product can set its own `heroDescription` instead; a product opened
    // from the systems grid has neither, and the paragraph is left out. A
    // product can also set `hideHeroIntro` to drop its suite's intro here
    // while the landing card keeps it.
    const comboIntro = product.hideHeroIntro
      ? null
      : combos.find((c) => c.detailId === product.id)?.effect ||
        (product.heroDescription ? [product.heroDescription] : null);

    // The headline stack: the rotating green word with the words around it,
    // over a grey subtitle. A product can carry its own; the rest share the
    // landing page's.
    const hero = product.hero || {
      lead: "Work",
      words: ["SMART", "FAST", "BETTER"],
      tail: " with AI.",
      subtitle: getText("subtitle2"),
    };

    // The plain (non-heroTitleLines) hero title is one flex row — logo then
    // name — so a long name has to fit on one line or the row's cross-axis
    // centering leaves the logo floating between the wrapped lines instead
    // of beside the text. Shrink the font for longer names below `lg` so it
    // still fits at phone/tablet widths instead of wrapping; `lg` and up
    // always uses the same size as the landing page hero.
    // Each branch below is written out as one complete class string (not
    // assembled with `lg:${...}`) because Tailwind's build-time scanner only
    // picks up literal class text — a class name pieced together at runtime
    // never gets its CSS generated, so the `lg:` override would silently
    // no-op.
    const heroTitleText = product.heroTitle || product.name;
    const heroTitleSizeClass = product.heroTitleLines
      ? "text-[min(12.5vw,clamp(1.75rem,6.4svh_+_0.6vw,4rem))]"
      : heroTitleText.length >= 17
        ? "text-[min(6vw,clamp(1.1rem,3.8svh_+_0.3vw,2.75rem))] lg:text-[min(12.5vw,clamp(1.75rem,6.4svh_+_0.6vw,4rem))]"
        : heroTitleText.length >= 13
          ? "text-[min(7.2vw,clamp(1.3rem,4.4svh_+_0.35vw,3.1rem))] lg:text-[min(12.5vw,clamp(1.75rem,6.4svh_+_0.6vw,4rem))]"
          : "text-[min(12.5vw,clamp(1.75rem,6.4svh_+_0.6vw,4rem))]";

    return (
      <>
        {/* Same space background as the landing page: body paints #050810 and
            these fixed layers sit at z-0, so the content rides above at z-10. */}
        <div className="stars"></div>
        <div className="nebula"></div>
        {revealed && <SparkleField />}
        {/* The menu links target landing-page sections, so `goHome` takes the
            reader back there first and scrolls to the section afterwards. */}
        <SiteHeader
          onNavigate={goHome}
          onOpenPage={openSolutionPage}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        {/* pt-20 clears the fixed top menu, matching the landing page. */}
        <div className="min-h-screen text-white px-4 sm:px-6 lg:px-8 pt-20 pb-10 sm:pb-14 lg:pb-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Hero — the landing page's headline stack over the video card,
                all inside one viewport-height budget. */}
            {/* A page can set `heroArt` to show one illustration in place of
                the headline stack and video. */}
            {product.heroArt ? (
              <div className="mb-12 sm:mb-16 flex items-center justify-center landscape:min-h-[calc(100svh-5rem)]">
                <HeroArt
                  src={`${import.meta.env.BASE_URL}${product.heroArt}`}
                  alt="ZARA holding the rotating AIO logo above her open hand"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-[2.5svh] mb-12 sm:mb-16 landscape:min-h-[calc(100svh-5rem)]">
                <h1 className={`relative flex items-center justify-center px-4 font-extrabold text-center leading-[1.0625] tracking-[-0.009em] ${heroTitleSizeClass}`}>
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
                    <span className="flex items-center justify-center gap-[0.3em] whitespace-nowrap">
                      <AioLogo className="logo-glow h-[1.25em] w-[1.25em] shrink-0" />
                      <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]">
                        {heroTitleText}
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

                {/* Hero media — same card and height budget as the landing page
                    hero, so it can never grow taller than the viewport allows.
                    A product carries a clip or, like AIO Lab, a still; the card
                    is the same either way. */}
                {(product.video || product.image) && (
                  <div className="w-full flex justify-center px-4">
                    <div className="group relative w-[min(100%,calc(50svh*16/9))] overflow-hidden rounded-2xl border border-green-500 bg-[#0a0f1a]/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(80,192,64,0.35)]">
                      {product.video ? (
                        <AutoplayVideo
                          className="block w-full aspect-video object-cover bg-black"
                          src={`${import.meta.env.BASE_URL}${product.video}`}
                          poster={`${import.meta.env.BASE_URL}${product.video.replace(
                            /\.mp4$/,
                            "-poster.jpg"
                          )}`}
                          controls={false}
                        />
                      ) : (
                        <img
                          className="block w-full aspect-video object-cover bg-black"
                          src={`${import.meta.env.BASE_URL}${product.image}`}
                          alt={`${product.heroTitle || product.name} preview`}
                        />
                      )}
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
            )}

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

          {/* The About pages' own copy, in the landing page's section type:
              white heading over a grey one, then the body and an optional
              bold closing line. */}
          {product.aboutSections && (
            <div className="max-w-6xl mx-auto">
              {product.aboutSections.map((section) => (
                <div key={section.title} className="mb-20 sm:mb-28 lg:mb-36 text-center">
                  <h2 className="font-bold mb-2 sm:mb-3 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                    {section.title}
                  </h2>
                  <p className="font-bold text-gray-400 mb-3 sm:mb-4 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                    {section.subtitle}
                  </p>
                  {section.body?.length > 0 && (
                    <div className="space-y-3 sm:space-y-4 text-sm sm:text-base lg:text-lg text-gray-400 max-w-4xl mx-auto px-4">
                      {section.body.map((paragraph, idx) => (
                        <p key={idx}>{aboutLines(paragraph)}</p>
                      ))}
                    </div>
                  )}
                  {/* Named entries under the copy, e.g. the suite's products:
                      a Key Features-size name, a bold grey line, then copy. */}
                  {section.items?.length > 0 && (
                    <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 sm:gap-y-12 max-w-5xl mx-auto px-4">
                      {section.items.map((item) => (
                        <div key={item.title}>
                          <h3 className="mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold">
                            {item.title}
                          </h3>
                          <p className="mb-2 text-base sm:text-lg lg:text-xl font-bold text-gray-400">
                            {item.tagline}
                          </p>
                          <p className="text-sm sm:text-base lg:text-lg text-gray-400">
                            {item.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {section.tagline && (
                    <p
                      className={`${
                        section.items ? "mt-10 sm:mt-12" : "mt-6 sm:mt-8"
                      } px-4 text-xl sm:text-2xl lg:text-3xl font-bold text-white`}
                    >
                      {aboutLines(section.tagline)}
                    </p>
                  )}
                </div>
              ))}

              <div className="text-center">
                <h2 className="font-bold text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                  {product.aboutClosing}
                </h2>
                {product.aboutClosingSubtitle && (
                  <p className="mt-2 sm:mt-3 font-bold text-gray-400 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                    {product.aboutClosingSubtitle}
                  </p>
                )}
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
          )}

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
                repeats. A thin product (no `aiRole` yet) just skips it. */}
            {product.aiRole && (
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
            )}

            {/* Same treatment: no panel, landing page type. Only products
                that set `challenge` show it. */}
            {product.challenge && (
              <div className="mb-20 sm:mb-28 lg:mb-36 text-center">
                <h2 className="font-bold mb-3 sm:mb-4 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                  The Challenge
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-4xl mx-auto px-4">
                  {product.challenge}
                </p>
              </div>
            )}

            {/* Same treatment: no panel, landing page type. */}
            {product.problemSolved && (
              <div className="mb-20 sm:mb-28 lg:mb-36 text-center">
                <h2 className="font-bold mb-3 sm:mb-4 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                  {product.problemSolvedTitle || "Problem Solved"}
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
            )}

            {/* Same treatment: no panel, landing page type. */}
            {product.benefit && (
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
                      <div key={idx} className="flex items-start">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
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
            )}

            {/* Same treatment: no panel, landing page type. */}
            {product.targetUsers?.length > 0 && (
              <div className="mb-20 sm:mb-28 lg:mb-36">
                <h2 className="font-bold mb-6 sm:mb-8 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                  Build For
                </h2>
                {/* A single left-aligned list, like Key Features below. */}
                <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto px-4">
                  {product.targetUsers.map((user, idx) => (
                    <div key={idx} className="flex items-start">
                      {/* green-500 is the Learn more / Request a Demo button fill. */}
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                      <span className="text-sm sm:text-base lg:text-lg text-gray-400">
                        {user}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Same treatment: no panel, landing page type. */}
            {product.features?.length > 0 && (
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
            )}

            {/* Same list treatment as Key Features, with a subtitle under the
                heading. Only products that set `useCases` show it. */}
            {product.useCases?.items.length > 0 && (
              <div className="mb-20 sm:mb-28 lg:mb-36">
                <h2 className="font-bold mb-3 sm:mb-4 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                  Use Cases
                </h2>
                {product.useCases.subtitle && (
                  <p className="mb-6 sm:mb-8 px-4 text-center text-xl sm:text-2xl lg:text-3xl font-bold">
                    {product.useCases.subtitle}
                  </p>
                )}
                <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto px-4">
                  {product.useCases.items.map((useCase, idx) => (
                    <div key={idx} className="flex items-start">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>
                        <span className="block mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold">
                          {useCase.title}
                        </span>
                        <span className="block text-sm sm:text-base lg:text-lg text-gray-400">
                          {useCase.body}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* The About page closes with its own sections above. */}
          {!product.aboutSections && (
            <>
              {/* The landing page's architecture section, headings and all, so a
                  reader who lands straight on a product still gets the sovereignty
                  claim. Mirrors #architecture in the landing tree below, down to its
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
                  {/* A product can carry its own closing line; the rest share
                      the agent pitch. */}
                  <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-4xl mx-auto px-4">
                    {product.ctaTagline || "Chat. Act. Done."}
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
            </>
          )}

          <ScrollToTopButton />

          <div className="mt-16 sm:mt-20">
            <SiteFooter onNavigate={goHome} onOpenPage={openSolutionPage} />
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
        <SplashScreen
          key={splashRun}
          showMs={splashMs}
          onReveal={reveal}
          zaraArt={SPLASH_ART}
        />
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
      <SplashScreen
        key={splashRun}
        showMs={splashMs}
        onReveal={reveal}
        zaraArt={SPLASH_ART}
      />
      <div className={`stars ${revealed ? "" : "invisible"}`}></div>
      <div className={`nebula ${revealed ? "" : "invisible"}`}></div>
      {revealed && <SparkleField />}
      <div className={revealed ? undefined : "invisible"}>
        <SiteHeader
          onNavigate={scrollToSection}
          onOpenPage={openSolutionPage}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
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
                    words={["SMART", "FAST", "BETTER"]}
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
                <div className="group relative w-[min(100%,calc(50svh*16/9))] overflow-hidden rounded-2xl border border-green-500 bg-[#0a0f1a]/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(80,192,64,0.35)]">
                  <AutoplayVideo
                    className="block w-full aspect-video object-cover bg-black"
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

            {/* Intro under the hero video: heading, grey subheading, then
                the copy. */}
            <div id="meet" className="mt-2 px-4 scroll-mt-24 lg:scroll-mt-28">
              <h2 className="font-bold mb-2 sm:mb-3 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                Meet AI Office Suite.
              </h2>
              {/* Grey heading-size line, like "Fully secure, sovereign and
                  maximum control." under the architecture heading. */}
              <p className="font-bold text-gray-400 mb-3 sm:mb-4 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
                Your work, with AI built in.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-4xl mx-auto">
                Find. Create. Analyse. Automate.
                <br />
                Everything you need to get work done—smart, fast, and
                simpler.
              </p>
            </div>

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

        {/* Statement section — hidden for now; uncomment to bring it back.
        <div className="max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-36">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-bold text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
              An Office with an Intelligent Workspace.
            </h2>
            <h2 className="font-bold text-gray-400 mt-2 sm:mt-3 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
              Get more done.{" "}
              <br className="sm:hidden" />
              <span className="whitespace-nowrap">Make better decisions.</span>
            </h2>
          </div>
        </div>
        */}

        <div id="benefit" className="max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-36 scroll-mt-24 lg:scroll-mt-28">
          <div className="text-center px-4">
            <h2 className="font-bold mb-2 sm:mb-3 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
              Benefits
            </h2>
            <p className="font-bold text-gray-400 mb-3 sm:mb-4 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
              Work smart. Move fast.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-4xl mx-auto">
              Reduce repetitive work, simplify everyday tasks, and help your
              organization get more value from AI.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-36">
          <h2 className="font-bold mb-3 sm:mb-4 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
            Your AI Buddy.
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
                {combo.tagline && (
                  <p className="mb-3 text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 text-center">
                    {combo.tagline}
                  </p>
                )}
                <div className="grow mb-8 sm:mb-10 text-sm sm:text-base lg:text-lg text-gray-400 text-center">
                  <p>{combo.effect.join(" ")}</p>
                  {combo.outro && (
                    <p className="mt-3 font-semibold text-white">{combo.outro}</p>
                  )}
                </div>

                {/* Green box wraps the video only — matches the hero video card */}
                <div className="group w-full overflow-hidden rounded-2xl border border-green-500 bg-[#0a0f1a]/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(80,192,64,0.35)]">
                  <AutoplayVideo
                    className="block w-full aspect-video object-cover bg-black"
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

        {/* Placeholder product sections — same layout as “Your AI Buddy.” */}
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
                  {/* Same card copy layout as the ZARA cards: tagline, one or
                      more paragraphs, then a closing line. */}
                  {product.tagline && (
                    <p className="mb-3 text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 text-center">
                      {product.tagline}
                    </p>
                  )}
                  <div className="grow mb-8 sm:mb-10 space-y-3 text-sm sm:text-base lg:text-lg text-gray-400 text-center">
                    {[].concat(product.description).map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                    {product.outro && (
                      <p className="font-semibold text-white">{product.outro}</p>
                    )}
                  </div>

                  <div className="group w-full overflow-hidden rounded-2xl border border-green-500 bg-[#0a0f1a]/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(80,192,64,0.35)]">
                    {/* Items without a `video` or `image` fall back to the "coming soon" placeholder */}
                    {product.video ? (
                      <AutoplayVideo
                        className="block w-full aspect-video object-cover bg-black"
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
                        className="block w-full aspect-video object-cover bg-black"
                        src={`${import.meta.env.BASE_URL}${product.image}`}
                        alt={`${product.name} preview`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-black/60 flex flex-col items-center justify-center gap-2 text-gray-500">
                        <Play className="w-10 h-10 sm:w-12 sm:h-12" />
                        <span className="text-xs sm:text-sm">Media coming soon</span>
                      </div>
                    )}
                  </div>

                  {/* Items without a `detailId` have no detail page yet, so
                      the button says so and stays inert rather than routing
                      nowhere; the arrow goes with the link it would have
                      opened. */}
                  <button
                    type="button"
                    onClick={() => {
                      if (product.detailId) navigate(product.detailId);
                    }}
                    className="mt-8 sm:mt-10 mx-auto inline-flex items-center gap-2 rounded-md bg-green-500 px-5 py-2.5 text-sm sm:text-base font-medium text-black transition-colors duration-300 hover:bg-green-400"
                  >
                    {product.detailId ? (
                      <>
                        Learn more
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    ) : (
                      "Coming Soon"
                    )}
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



        <div id="architecture" className="max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-36 scroll-mt-24 lg:scroll-mt-28">
          <h1 className="font-bold mb-2 sm:mb-3 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
            {/* ⚙️ TECH ARCHITECTURE */}
            Your AI. Your Data. Your Infra.
          </h1>
          <h1 className="font-bold text-gray-400 mb-8 sm:mb-10 text-center text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
            Fully secure, sovereign and maximum control.
          </h1>
          <AioPillars />
        </div>

        {/* Closing call to action, same as the product pages'. */}
        <div className="max-w-6xl mx-auto mb-16 sm:mb-20 text-center">
          <h2 className="font-bold mb-3 sm:mb-4 text-[min(5.4vw,clamp(1.125rem,4svh_+_0.4vw,3rem))] leading-[1.08349] tracking-[-0.003em]">
            Ready to Deploy AI Office Suite?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-4xl mx-auto px-4">
            {getText("subtitle2")}
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

        {/* Floating Scroll to Top Button */}
        <ScrollToTopButton />

        {/* Footer Section */}
        <SiteFooter onNavigate={scrollToSection} onOpenPage={openSolutionPage} />
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
