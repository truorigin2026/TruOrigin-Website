export type BlogLink = {
  text: string;
  href: string;
  external?: boolean;
};

export type BlogSegment = string | BlogLink;

export type BlogContentBlock =
  | { type: "paragraph"; segments: BlogSegment[] }
  | { type: "heading"; text: string }
  | { type: "list"; items: BlogSegment[][] }
  | { type: "cta"; text: string; linkText: string; href: string };

export type BlogPost = {
  slug: string;
  cluster: string;
  category: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  date: string;
  isoDate: string;
  readTime: string;
  image: string;
  imageAlt: string;
  keywords: string[];
  content: BlogContentBlock[];
};

const bookDemo: BlogLink = { text: "Book a demo", href: "/for-brands/contact" };

export const blogPosts: BlogPost[] = [
  {
    slug: "clinically-tested-paraben-free-what-labels-really-tell-you",
    cluster: "claims-literacy",
    category: "Claims & Labels",
    title: 'What Do "Clinically Tested" and "Paraben Free" Really Tell You?',
    excerpt:
      '"Clinically Tested." "Paraben Free." These phrases are everywhere on packaging, but what do they actually mean, and where’s the information behind them?',
    metaDescription:
      'Clinically Tested and Paraben Free are on almost every skincare and supplement label. Learn what these claims actually mean and how to find the evidence behind them.',
    date: "Aug 20, 2026",
    isoDate: "2026-08-20",
    readTime: "6 min read",
    image: "/images/blogs/clinically-tested-paraben-free-what-labels-really-tell-you.jpg",
    imageAlt: "Skincare and supplement labels showing common claim phrases like Clinically Tested and Paraben Free",
    keywords: [
      "clinically tested meaning",
      "paraben free claims",
      "product label transparency",
      "skincare claim documentation",
      "what does dermatologically tested mean",
    ],
    content: [
      {
        type: "paragraph",
        segments: [
          'Pick up almost any skincare product, supplement, or personal care item, and you’ll find a phrase like this somewhere on the label: "Clinically Tested." "Paraben Free." "Dermatologically Tested." They’re everywhere, and they’re designed to reassure you. But reassurance isn’t the same as information.',
        ],
      },
      { type: "heading", text: "The Problem With Label Phrases" },
      {
        type: "paragraph",
        segments: [
          'These claims are short by necessity: packaging only has so much space. "Clinically Tested" might mean a full clinical trial with hundreds of participants, or it might mean a much smaller internal test with a handful of people. "Paraben Free" tells you what isn’t in the product, but not what’s used instead, or why that substitution matters to you specifically.',
        ],
      },
      {
        type: "paragraph",
        segments: [
          "None of this makes the claim untrue. It just means the phrase on the front of the pack is a headline, not the article. The actual information (what was tested, how, on whom, and what the results showed) usually exists somewhere. It’s just not on the label, because it physically can’t be.",
        ],
      },
      { type: "heading", text: "Where Does the Real Information Live?" },
      {
        type: "paragraph",
        segments: ["Usually, it’s scattered across a few places:"],
      },
      {
        type: "list",
        items: [
          ["A clinical summary that might be posted on the brand’s website, if you know where to look."],
          ['A certification filed away as a PDF in a "Resources" or "Downloads" page most visitors never open.'],
          ["Ingredient sourcing details that only surface if a customer emails support directly and waits for a reply."],
        ],
      },
      {
        type: "paragraph",
        segments: [
          "For a customer who genuinely wants to understand a product before buying it, and a growing share of shoppers do, especially in skincare and wellness, this fragmentation is genuinely frustrating. You either take the label claim on faith, or you go digging across multiple sources and hope you find something useful. Regulatory guidance like the ",
          { text: "FDA's cosmetics labeling rules", href: "https://www.fda.gov/cosmetics", external: true },
          ' exists precisely because "tested" and "free from X" claims can mean very different things depending on how they’re substantiated.',
        ],
      },
      { type: "heading", text: "What Should Change" },
      {
        type: "paragraph",
        segments: [
          "The claim itself isn’t the problem. Brands make these claims because the underlying work (the testing, the sourcing, the documentation) is real and often significant. The problem is the gap between the claim and the information that supports it.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "That’s the gap TruOrigin was built to close. Instead of a label phrase with no easy path to more, TruOrigin connects each claim directly to its supporting information: test summaries, certifications, ingredient data, all presented in a format customers can actually explore, without needing to read a full lab report or hunt through a website. It’s the same structure we cover in ",
          {
            text: "The Claims on the Pack: What Should You Actually Look For",
            href: "/for-brands/resources/blog/claims-on-the-pack-what-to-look-for",
          },
          ", which walks through the specific questions worth asking before relying on any label claim.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "Our framework is simple: Claim → Evidence → Clarity. A claim on its own is a statement. A claim connected to its supporting information is something a customer can actually evaluate for themselves.",
        ],
      },
      {
        type: "cta",
        text: "Curious what this looks like for your own product line?",
        linkText: bookDemo.text,
        href: bookDemo.href,
      },
    ],
  },
  {
    slug: "product-has-20-things-to-say",
    cluster: "information-gap",
    category: "Transparency",
    title: "Your Product Has 20 Things to Say. Why Can't Customers See Them?",
    excerpt:
      "Most brands have far more product information than makes it to the customer. Here's why that gap exists, and what it costs.",
    metaDescription:
      "Most brands know far more about their products than customers ever see. Learn why product documentation stays hidden, and what it costs brands commercially.",
    date: "Aug 13, 2026",
    isoDate: "2026-08-13",
    readTime: "7 min read",
    image: "/images/blogs/product-has-20-things-to-say.jpg",
    imageAlt: "A brand's scattered product documentation: testing reports, certifications, and sourcing files",
    keywords: [
      "product transparency",
      "brand documentation",
      "product evidence for customers",
      "product information gap",
      "sourcing and testing documentation",
    ],
    content: [
      {
        type: "paragraph",
        segments: [
          "Talk to almost any product team and you’ll find they know an enormous amount about what they’ve made. Ingredient sourcing decisions. Testing protocols. Certification processes. Formulation trade-offs. Manufacturing standards. Sustainability data. Most of this represents real effort: time, cost, and expertise that went into the product long before it reached a shelf.",
        ],
      },
      { type: "paragraph", segments: ["Almost none of it reaches the customer."] },
      { type: "heading", text: "Where It All Goes" },
      {
        type: "paragraph",
        segments: [
          "It’s not that brands are hiding this information. It’s that there’s no single place designed to hold it and present it well. Instead, it ends up scattered:",
        ],
      },
      {
        type: "list",
        items: [
          ["A line on the packaging, if there’s room."],
          ["A page on the website, if someone remembered to update it."],
          ["A PDF certification, filed away and rarely linked anywhere visible."],
          ["Internal documents that never leave the company at all."],
        ],
      },
      {
        type: "paragraph",
        segments: [
          "Each piece might be accurate and complete on its own. But a customer trying to understand the full picture of a product has no single place to go. They’d have to already know what to look for, and where, and most people simply won’t.",
        ],
      },
      { type: "heading", text: "The Cost of the Gap" },
      {
        type: "paragraph",
        segments: [
          "This isn’t just an inconvenience. For a brand that has genuinely done the work (sourced responsibly, tested rigorously, documented thoroughly), an inaccessible information trail means that work isn’t doing anything for them commercially. A customer who can’t easily find the evidence behind a product has no reason to choose it over a competitor’s product that made similar claims with less behind them.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "In categories like supplements, skincare, and wellness, where confidence is often the actual purchase driver, that’s a real cost, not a minor one. It’s the same dynamic we map out in ",
          {
            text: "Where Does All Your Product Documentation Actually Go?",
            href: "/for-brands/resources/blog/where-does-all-your-product-documentation-go",
          },
          ", which traces exactly where this information tends to get lost inside a brand.",
        ],
      },
      { type: "heading", text: "Structuring What's Already There" },
      {
        type: "paragraph",
        segments: [
          "The fix isn’t necessarily more documentation. Most brands already have what they need: the work has been done. What’s missing is structure: a consistent way to connect each piece of product information to the claim it supports, and present it so a customer can explore it without needing to hunt.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "This is the core of what TruOrigin does. It doesn’t replace your packaging, your website, or your existing documentation. It organizes what already exists into a format customers can actually navigate: Claim → Evidence → Summary → Understanding. To see the customer-facing side of that structure, ",
          { text: "About Product Information", href: "/for-products/how-it-works" },
          " walks through exactly what a shopper sees the moment they scan.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "Your product likely has more to say than currently reaches anyone. The goal isn’t to say more. It’s to make sure what’s already true is actually visible.",
        ],
      },
      {
        type: "cta",
        text: "Have a product with more documentation than your packaging or website can show?",
        linkText: bookDemo.text,
        href: bookDemo.href,
      },
    ],
  },
  {
    slug: "information-exists-but-is-it-findable",
    cluster: "findability",
    category: "Customer Experience",
    title: "Your Information Is There. But Can Customers Find It?",
    excerpt:
      "Having product information isn't the same as having it be findable. The difference matters more than most brands realize.",
    metaDescription:
      "Product information that exists but can't be found isn't really accessible. Learn the difference between existing and findable, and why it matters for the customer experience.",
    date: "Aug 6, 2026",
    isoDate: "2026-08-06",
    readTime: "6 min read",
    image: "/images/blogs/information-exists-but-is-it-findable.jpg",
    imageAlt: "A customer scanning a product with a smartphone to look up its supporting information",
    keywords: [
      "product information findability",
      "brand transparency",
      "customer confidence",
      "structured product data",
      "accessible product documentation",
    ],
    content: [
      {
        type: "paragraph",
        segments: [
          "Most brands, when asked, will say they’re transparent. Ingredient lists exist. Certifications have been earned. Testing has been documented. If a customer really wanted to find this information, technically, they could.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          'But "technically possible to find" and "actually findable" are very different standards, and the gap between them is where a lot of customer confidence quietly leaks away.',
        ],
      },
      { type: "heading", text: "The Difference Between Existing and Findable" },
      { type: "paragraph", segments: ["Information that exists but requires a customer to:"] },
      {
        type: "list",
        items: [
          ["Know it exists in the first place"],
          ["Guess which page of the website it might be on"],
          ["Download and open a PDF just to check one fact"],
          ["Contact customer support and wait for a reply"],
        ],
      },
      {
        type: "paragraph",
        segments: [
          "…is not, in any practical sense, accessible. Most customers won’t go through more than one or two of those steps before giving up. Not because they don’t care about the answer, but because the cost of finding it outweighs their patience.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "This isn’t a customer failing. It’s a structural one. Product information is usually built for internal use, regulatory filing, or one-off web pages, not for a customer standing in front of a product, phone in hand, wanting a quick, clear answer.",
        ],
      },
      { type: "heading", text: "Why This Matters More Now" },
      {
        type: "paragraph",
        segments: [
          "Customers increasingly research before they buy, especially in categories like supplements, skincare, and wellness, where a product’s claims directly affect whether someone feels confident enough to put it on their skin or in their body. A brand that has done real work but makes that work hard to find is, in practice, competing on equal footing with a brand that’s done far less. That’s not a fair outcome for the brands that have actually invested in testing, sourcing, and documentation. It’s exactly the gap we dig into further in ",
          {
            text: "Why Findability Matters Most in Skincare and Supplements",
            href: "/for-brands/resources/blog/why-findability-matters-in-skincare-and-supplements",
          },
          ".",
        ],
      },
      { type: "heading", text: 'Turning "Exists" Into "Findable"' },
      {
        type: "paragraph",
        segments: [
          "The fix isn’t about creating new information. It’s about restructuring how existing information is presented. Instead of a customer needing to know where to look, the information should be organized around what they’re actually asking: what does this claim mean, and what backs it up?",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "That’s the structure TruOrigin builds. Through ",
          {
            text: "OriginCard",
            href: "/for-brands/resources/blog/what-if-product-had-its-own-information-card",
          },
          " and dedicated product pages, a customer moves from a claim straight to its supporting information: no guessing which page, no downloading a PDF blind, no waiting on an email reply.",
        ],
      },
      {
        type: "cta",
        text: "If your product's documentation is more complete than your website makes it look,",
        linkText: bookDemo.text,
        href: bookDemo.href,
      },
    ],
  },
  {
    slug: "what-if-product-had-its-own-information-card",
    cluster: "origincard",
    category: "OriginCard",
    title: "What If the Product Came With Its Own Information Card?",
    excerpt: "Introducing the idea behind OriginCard, a structured, explorable information layer attached to every product claim.",
    metaDescription:
      "OriginCard turns every product claim into an explorable path to its supporting evidence. Learn how a structured information card builds customer confidence.",
    date: "Jul 30, 2026",
    isoDate: "2026-07-30",
    readTime: "6 min read",
    image: "/images/blogs/what-if-product-had-its-own-information-card.jpg",
    imageAlt: "A structured digital information card attached to a product, showing claims linked to evidence",
    keywords: [
      "OriginCard",
      "product information card",
      "QR code product transparency",
      "claim to evidence structure",
      "digital product passport",
    ],
    content: [
      {
        type: "paragraph",
        segments: [
          "Most products come with a lot of paper, in one form or another. Instructions. Ingredient lists. Warranty cards. Certifications, sometimes. But none of it is really designed to answer the question a curious customer actually has: what’s behind what this product claims?",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "What if that question had a direct answer, not buried in a manual, but attached to the product itself, in a format built specifically to be explored?",
        ],
      },
      { type: "heading", text: "Introducing the Idea of an Information Card" },
      {
        type: "paragraph",
        segments: [
          "Picture a structured card attached to a product, physically or digitally, that does one job: connect every claim the brand makes to the information that supports it. Not a slogan. Not fine print. An actual, organized path from claim to evidence to a plain-language summary a customer can understand without technical background.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          'Tap "Paraben Free" and see exactly what that means and what’s used instead. Tap "Third-Party Tested" and see the certification behind it. Tap an ingredient and see sourcing and formulation context.',
        ],
      },
      {
        type: "paragraph",
        segments: [
          "This is the concept behind OriginCard: TruOrigin’s structured product information layer. It doesn’t replace your packaging or your website. It sits alongside them, giving every claim a direct, explorable path to the documentation behind it.",
        ],
      },
      { type: "heading", text: "Why a “Card” Instead of Just a Web Page" },
      {
        type: "paragraph",
        segments: [
          "A regular product page tries to do everything: sell the product, tell a brand story, list specs. Supporting evidence usually gets buried near the bottom, if it appears at all.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "An information card is different: its only job is showing customers the structure behind a product’s claims, organized the same way every time, so customers know exactly where to look regardless of which product or brand they’re viewing. That consistency matters. Once a customer understands how one OriginCard works, they understand how to explore any product using it, which lowers the friction of actually engaging with the information, rather than skimming past it.",
        ],
      },
      { type: "heading", text: "What This Means for Brands" },
      {
        type: "paragraph",
        segments: [
          "For brands that have already done the work (real testing, real sourcing, real certifications), an information card gives that work somewhere to actually live and be seen. It turns documentation that currently sits in a folder somewhere into something that actively builds customer confidence at the exact moment a customer is deciding whether to choose the product. To see how this plays out in practice, take a look at ",
          {
            text: "How OriginCard Turns Product Documentation Into a Customer-Facing Asset",
            href: "/for-brands/resources/blog/how-origincard-turns-documentation-into-trust",
          },
          ".",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "Claim → Evidence → Summary → Understanding: built into the product experience itself, not left as something the customer has to go find.",
        ],
      },
      {
        type: "cta",
        text: "Want to see what an OriginCard looks like for one of your own products?",
        linkText: bookDemo.text,
        href: bookDemo.href,
      },
    ],
  },
  {
    slug: "claims-on-the-pack-what-to-look-for",
    cluster: "claims-literacy",
    category: "Claims & Labels",
    title: "The Claims on the Pack: What Should You Actually Look For?",
    excerpt:
      "Not all product claims carry the same weight. Here's what's worth paying attention to, and what questions are worth asking before you rely on a claim.",
    metaDescription:
      "Learn the three questions worth asking before relying on any product claim, from Non-Comedogenic to Third-Party Tested, and why most claims fail the third one.",
    date: "Jul 23, 2026",
    isoDate: "2026-07-23",
    readTime: "6 min read",
    image: "/images/blogs/claims-on-the-pack-what-to-look-for.jpg",
    imageAlt: "Close-up of skincare and supplement packaging showing common marketing claims",
    keywords: [
      "how to evaluate product claims",
      "well-supported label claims",
      "third party tested meaning",
      "clinically tested vs certified",
      "consumer label literacy",
    ],
    content: [
      {
        type: "paragraph",
        segments: [
          'Every product category has its own vocabulary of claims. Skincare has "Non-Comedogenic" and "Hypoallergenic." Supplements have "High Potency" and "Third-Party Tested." Food has "All Natural" and "No Added Sugar." Cosmetics have "Cruelty Free" and "Reef Safe."',
        ],
      },
      {
        type: "paragraph",
        segments: [
          "Some of these claims are backed by rigorous, documented work. Others are looser: technically accurate but light on substance. As a customer, there’s usually no easy way to tell the difference just by reading the front of the pack.",
        ],
      },
      { type: "heading", text: "Three Questions Worth Asking" },
      {
        type: "paragraph",
        segments: [
          "Before taking any product claim at face value, three questions tend to separate the well-supported claims from the vague ones:",
        ],
      },
      {
        type: "list",
        items: [
          [
            'What specifically was tested or documented? "Clinically Tested" for what: irritation, efficacy, allergic reaction? A claim that’s specific ("Tested for skin irritation on 50 participants over 4 weeks") tells you more than one that isn’t.',
          ],
          [
            "Who is the information coming from? Was the underlying documentation something the brand generated internally, or is it a third-party certification with its own standards, like the ones tracked by ",
            { text: "Leaping Bunny", href: "https://www.leapingbunny.org/", external: true },
            " for cruelty-free claims? Both can be legitimate, but they mean different things.",
          ],
          [
            "Can I actually see it? This is the one most claims fail. Even when solid work sits behind a claim, it’s often inaccessible: locked in an internal file, referenced vaguely, or simply never published anywhere a customer would find it.",
          ],
        ],
      },
      { type: "heading", text: "Why This Is Hard for Customers Right Now" },
      {
        type: "paragraph",
        segments: [
          "The honest answer is that most customers don’t ask these questions, not because they don’t care, but because doing so is genuinely inconvenient. It means leaving the product page, searching a brand’s website, maybe emailing customer support, and often coming up empty anyway.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "That friction pushes most people toward one of two extremes: blind acceptance of the label, or blanket skepticism toward all claims. Neither is a great outcome, for customers or for the brands making legitimate, well-documented claims that simply aren’t easy to find. Brands should hold their own claims to this same standard before printing them, a process we cover in ",
          {
            text: "A Brand's Guide to Making Claims That Actually Hold Up",
            href: "/for-brands/resources/blog/a-brands-guide-to-claims-that-hold-up",
          },
          ".",
        ],
      },
      { type: "heading", text: "Making the Supporting Information Findable" },
      {
        type: "paragraph",
        segments: [
          "This is the specific gap TruOrigin addresses. Rather than a claim standing alone on a label with no easy path to its supporting details, TruOrigin gives brands a structured way to connect each claim to the documentation behind it: testing summaries, certifications, ingredient sourcing, organized so a customer can explore it without needing technical expertise or a lot of patience.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "The claim itself doesn’t change. What changes is whether a customer can actually look into it, in a few taps, instead of a frustrating search.",
        ],
      },
      {
        type: "cta",
        text: "Want to see how a claim-to-evidence structure looks for products in your category?",
        linkText: bookDemo.text,
        href: bookDemo.href,
      },
    ],
  },
  {
    slug: "what-if-every-product-could-explain-itself",
    cluster: "self-explaining-products",
    category: "Product Innovation",
    title: "What If Every Product Could Explain Itself?",
    excerpt:
      "Imagine picking up any product and being able to ask it questions directly: what's really in it, what's been tested, what backs up every claim.",
    metaDescription:
      "What if products weren't informational dead ends? Learn how a claim-to-evidence structure lets every product explain itself to the customer holding it.",
    date: "Jul 16, 2026",
    isoDate: "2026-07-16",
    readTime: "6 min read",
    image: "/images/blogs/what-if-every-product-could-explain-itself.jpg",
    imageAlt: "A customer exploring a product's information through a phone, moving from claim to evidence",
    keywords: [
      "self explaining products",
      "interactive product page",
      "QR code product experience",
      "claim to evidence to understanding",
      "product transparency technology",
    ],
    content: [
      {
        type: "paragraph",
        segments: [
          'Think about the last time you stood in front of a product, on a shelf or a screen, and had a genuine question about it. Maybe it was a supplement and you wanted to know exactly what "clinically tested" meant for that specific product. Maybe it was a skincare item and you wanted to understand an ingredient before putting it on your face.',
        ],
      },
      {
        type: "paragraph",
        segments: [
          "What did you do? For most people, the honest answer is: nothing. You either accepted the label claim, ignored it, or moved on to a different product entirely, not necessarily because the first one was worse, but because it was the only one you couldn’t quickly get an answer about.",
        ],
      },
      { type: "heading", text: "The Product as a Dead End" },
      {
        type: "paragraph",
        segments: [
          "Right now, most products are informational dead ends. The packaging says what it says, and once you’ve read it, that’s the end of the conversation. Any further questions require you to leave the product entirely: search a website, dig for a PDF, message customer support, and most people won’t.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "This is strange when you consider how much a brand actually knows about its own product. Sourcing decisions, testing protocols, certifications, formulation choices: all of it exists somewhere. The product just isn’t set up to share any of it beyond a few words on a label.",
        ],
      },
      { type: "heading", text: "A Different Starting Point" },
      {
        type: "paragraph",
        segments: [
          "Now imagine the opposite: a product that can explain itself. Not by cramming more text onto packaging that’s already full, but by giving every claim a direct path to the information behind it, accessible in a few taps, whenever a customer actually wants it.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          '"Clinically Tested" leads directly to what was tested, and how. "Third-Party Tested" leads to the certification itself. An ingredient leads to sourcing and formulation context, not just a name on a list. The customer decides how deep to go. Someone who just wants reassurance gets it quickly. Someone who wants to dig gets the full picture, without needing to become a researcher to find it. To see what this looks like once it’s actually built, read ',
          {
            text: "What a Self-Explaining Product Page Actually Looks Like",
            href: "/for-brands/resources/blog/what-a-self-explaining-product-page-looks-like",
          },
          ".",
        ],
      },
      { type: "heading", text: "Building Toward That" },
      {
        type: "paragraph",
        segments: [
          "This is the underlying idea behind TruOrigin. Rather than treating product information as something scattered across packaging, websites, and internal files, we structure it around a simple path: Claim → Evidence → Summary → Understanding. Through tools like ",
          {
            text: "OriginCard",
            href: "/for-brands/resources/blog/what-if-product-had-its-own-information-card",
          },
          ", a product stops being a dead end and starts being something a customer can actually explore.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "It’s not about making bigger claims. It’s about making the ones you’re already making genuinely explorable.",
        ],
      },
      {
        type: "cta",
        text: "Curious what a self-explaining product experience looks like for your brand?",
        linkText: bookDemo.text,
        href: bookDemo.href,
      },
    ],
  },
  {
    slug: "where-does-all-your-product-documentation-go",
    cluster: "information-gap",
    category: "Transparency",
    title: "Where Does All Your Product Documentation Actually Go?",
    excerpt:
      "Most brands have never mapped where their own product documentation actually lives. Here's what that sprawl looks like, and how to centralize it.",
    metaDescription:
      "Test results, certifications, and sourcing records rarely live in one place. Learn where product documentation typically ends up, and how to centralize it.",
    date: "Jul 9, 2026",
    isoDate: "2026-07-09",
    readTime: "5 min read",
    image: "/images/blogs/where-does-all-your-product-documentation-go.jpg",
    imageAlt: "Scattered folders and files representing a brand's fragmented product documentation",
    keywords: [
      "product documentation management",
      "brand internal documentation",
      "sourcing and testing records",
      "certification management for brands",
      "structured product data",
    ],
    content: [
      {
        type: "paragraph",
        segments: [
          "If you asked your own team to list every piece of documentation that exists behind one of your products (every test result, sourcing record, certification, formulation note), how long would that list actually be? For most brands, longer than they expect. And almost none of it is centralized in one place a customer, or even a new team member, could find on their own.",
        ],
      },
      { type: "heading", text: "A Quick Audit Most Brands Have Never Run" },
      {
        type: "paragraph",
        segments: [
          "Try this: pick one flagship product and trace where its supporting information actually lives today. You’ll usually find it split across a handful of places:",
        ],
      },
      {
        type: "list",
        items: [
          ["A shared drive or internal wiki that only employees can access."],
          ["A supplier or lab's own portal, holding certificates the brand doesn't even keep local copies of."],
          ["A marketing team's old website copy, which may or may not still be accurate."],
          ["Physical files or emails from a compliance review that happened once and was never revisited."],
        ],
      },
      {
        type: "paragraph",
        segments: [
          "None of these are wrong places to keep information. They’re just the wrong places to expect a customer, or even a retail partner, to look.",
        ],
      },
      { type: "heading", text: "Why This Documentation Sprawl Happens" },
      {
        type: "paragraph",
        segments: [
          "It’s rarely intentional. Documentation accumulates over a product’s life: a certification here, a reformulation note there, a new lab report after a supplier change. Each piece gets filed wherever made sense at the time. Nobody sets out to build an information maze. It just happens by accumulation, the same fragmentation problem we describe more broadly in ",
          { text: "Your Product Has 20 Things to Say", href: "/for-brands/resources/blog/product-has-20-things-to-say" },
          ".",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "The result is that even brands with genuinely rigorous practices can look, from the outside, indistinguishable from brands that cut corners, because neither one’s documentation is actually visible or organized in a way a customer could use.",
        ],
      },
      { type: "heading", text: "Centralizing Without Starting Over" },
      {
        type: "paragraph",
        segments: [
          "The fix isn’t re-doing the documentation work. It’s giving it one consistent home, connected directly to the claims it supports. TruOrigin’s OriginCard structure does exactly this: each claim on a product links to the specific piece of evidence behind it, pulled from whatever documentation already exists, without requiring brands to rewrite or duplicate their records.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "Once that structure exists, the question “where does this documentation actually go?” has one answer instead of five.",
        ],
      },
      {
        type: "cta",
        text: "Want to map out where your own product's documentation currently lives, and where it could go instead?",
        linkText: bookDemo.text,
        href: bookDemo.href,
      },
    ],
  },
  {
    slug: "hidden-cost-of-vague-label-claims",
    cluster: "claims-literacy",
    category: "Claims & Labels",
    title: "The Hidden Cost of Vague Label Claims",
    excerpt:
      "A vague product claim doesn't just under-deliver on confidence. It carries a commercial and regulatory cost that rarely shows up on a spreadsheet.",
    metaDescription:
      "Vague product claims carry a hidden confidence cost and regulatory risk. Learn why technically true isn't the same as defensible, and how to fix it.",
    date: "Jul 2, 2026",
    isoDate: "2026-07-02",
    readTime: "5 min read",
    image: "/images/blogs/hidden-cost-of-vague-label-claims.jpg",
    imageAlt: "A magnifying glass held over a product label, examining a vague marketing claim",
    keywords: [
      "vague product claims risk",
      "label claim substantiation",
      "brand confidence cost",
      "greenwashing risk",
      "FTC substantiation claims",
    ],
    content: [
      {
        type: "paragraph",
        segments: [
          '"Clinically Tested." "Paraben Free." Every brand has phrases like these somewhere on its packaging, and most of the time they’re added with good intentions: a quick, reassuring signal to a shopper scanning a shelf. But a vague claim carries a cost that rarely shows up on a spreadsheet.',
        ],
      },
      { type: "heading", text: "The Two Ways a Vague Claim Backfires" },
      {
        type: "paragraph",
        segments: [
          "First, there’s the confidence cost. A customer who can’t confirm what a claim actually means doesn’t automatically give the brand the benefit of the doubt. Increasingly, they just move on to a product that makes the same claim more convincingly, even if the underlying work is identical or weaker.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "Second, there’s the regulatory cost. Vague or unsubstantiated claims are exactly what agencies like the ",
          {
            text: "FTC",
            href: "https://www.ftc.gov/business-guidance/resources/green-guides-guides-use-environmental-marketing-claims",
            external: true,
          },
          " scrutinize under advertising substantiation rules. A brand doesn’t need to be making a false claim to run into trouble, just an unsupported one. A claim a brand can’t back up with accessible documentation is a liability sitting in plain sight on the packaging.",
        ],
      },
      { type: "heading", text: '"Technically True" Isn’t the Same as "Defensible"' },
      {
        type: "paragraph",
        segments: [
          'Most vague claims aren’t lies. "Paraben Free" is usually accurate. "Clinically Tested" usually did happen, in some form. The issue is that "technically true" and "clearly substantiated and easy to explain" are different standards, and only one of them actually protects a brand when a customer, or a regulator, asks a follow-up question.',
        ],
      },
      {
        type: "paragraph",
        segments: [
          "This is the same gap we cover in ",
          {
            text: "The Claims on the Pack: What Should You Actually Look For",
            href: "/for-brands/resources/blog/claims-on-the-pack-what-to-look-for",
          },
          ", but from the buyer’s side. Brands benefit from asking themselves the same three questions customers should be asking.",
        ],
      },
      { type: "heading", text: "Turning Vague Into Specific" },
      {
        type: "paragraph",
        segments: [
          "The fix isn’t to make bigger or bolder claims. It’s to make the ones you’re already making easy to explain, in a format that doesn’t require a customer to dig or a compliance team to intervene after the fact. TruOrigin structures that explanation into the product experience itself, connecting each claim to specific, presentable evidence (test summaries, certifications, sourcing notes) the moment a customer wants to check it.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "A claim you can explain in one tap is worth more, commercially and legally, than a claim you can only hope nobody questions.",
        ],
      },
      {
        type: "cta",
        text: "Want a plain-language review of how defensible your current label claims are?",
        linkText: bookDemo.text,
        href: bookDemo.href,
      },
    ],
  },
  {
    slug: "why-findability-matters-in-skincare-and-supplements",
    cluster: "findability",
    category: "Customer Experience",
    title: "Why Findability Matters Most in Skincare and Supplements",
    excerpt:
      "Findability matters for every product category, but skincare and supplements carry a higher bar, because the product interacts directly with the body.",
    metaDescription:
      "Skincare and supplement brands often have the strongest documentation and the worst findability. Learn why this category needs claim-to-evidence structure most.",
    date: "Jun 25, 2026",
    isoDate: "2026-06-25",
    readTime: "6 min read",
    image: "/images/blogs/why-findability-matters-in-skincare-and-supplements.jpg",
    imageAlt: "Skincare and supplement products lined up, representing categories where claim findability matters most",
    keywords: [
      "skincare product transparency",
      "supplement label claims",
      "ingestible and topical product claims",
      "wellness brand information",
      "supplement testing documentation",
    ],
    content: [
      {
        type: "paragraph",
        segments: [
          "Findability matters for every product category, but it matters differently depending on what a customer is actually deciding. Choosing between two similar phone chargers is low-stakes. Choosing what to put on your skin every day, or what to take internally as a supplement, is not, and that difference changes how much effort a customer is willing to put into finding the truth behind a claim.",
        ],
      },
      { type: "heading", text: "Why These Categories Carry More Weight" },
      {
        type: "paragraph",
        segments: [
          "Skincare and supplements share something most categories don’t: the product interacts directly with the body. That raises the bar for what “enough information” looks like. A customer isn’t just deciding whether a product works. They’re deciding whether it’s safe for them specifically, given their skin type, sensitivities, or existing supplement stack.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "This is also why regulatory bodies pay closer attention here. The FDA's ",
          { text: "guidance on dietary supplements", href: "https://www.fda.gov/food/dietary-supplements", external: true },
          " and its ",
          { text: "cosmetics labeling rules", href: "https://www.fda.gov/cosmetics", external: true },
          " both exist because claims in these categories carry real consequences when they’re unclear or unverifiable.",
        ],
      },
      { type: "heading", text: "The Findability Gap Is Wider Here, Not Narrower" },
      {
        type: "paragraph",
        segments: [
          "You’d expect categories under more scrutiny to have the most accessible documentation. In practice, it’s often the opposite: the documentation exists (because it has to, for compliance) but it’s written for regulators and internal teams, not for a customer trying to make a quick, confident decision. A lab report that satisfies a compliance requirement is rarely the same thing as an answer a shopper can actually use, a gap we explore more generally in ",
          {
            text: "Your Information Is There. But Can Customers Find It?",
            href: "/for-brands/resources/blog/information-exists-but-is-it-findable",
          },
          ".",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "The result: skincare and supplement brands often have stronger documentation than most categories, and worse findability, because that documentation was never translated into something explorable.",
        ],
      },
      { type: "heading", text: "Closing the Gap Where It Matters Most" },
      {
        type: "paragraph",
        segments: [
          "TruOrigin was built with exactly this kind of category in mind. Instead of a customer needing to interpret a certificate of analysis or a clinical summary on their own, OriginCard translates that same underlying documentation into a claim-by-claim structure anyone can navigate, without losing the rigor that made the original documentation credible in the first place.",
        ],
      },
      {
        type: "cta",
        text: "If your skincare or supplement line has documentation that's stronger than what your product page currently shows,",
        linkText: bookDemo.text,
        href: bookDemo.href,
      },
    ],
  },
  {
    slug: "a-brands-guide-to-claims-that-hold-up",
    cluster: "claims-literacy",
    category: "Claims & Labels",
    title: "A Brand's Guide to Making Claims That Actually Hold Up",
    excerpt:
      "A practical checklist for brands: how to test your own claims before you print them, and why documentation is a credibility asset, not just a compliance file.",
    metaDescription:
      "Learn how to build product claims backward from evidence, not the other way around, with a practical checklist for making claims that hold up to scrutiny.",
    date: "Jun 18, 2026",
    isoDate: "2026-06-18",
    readTime: "5 min read",
    image: "/images/blogs/a-brands-guide-to-claims-that-hold-up.jpg",
    imageAlt: "A brand team reviewing product claims and supporting documentation before publishing",
    keywords: [
      "how to substantiate product claims",
      "brand claim strategy",
      "defensible marketing claims",
      "product claim documentation checklist",
      "credible branding",
    ],
    content: [
      {
        type: "paragraph",
        segments: [
          "Most brands don’t set out to make weak claims. A claim usually starts as something true: a test was run, a certification was earned, an ingredient was sourced responsibly. It only becomes vague in translation, once it’s compressed down to fit on a label or a product page headline.",
        ],
      },
      { type: "heading", text: "A Simple Test Before You Print a Claim" },
      {
        type: "paragraph",
        segments: [
          "Before finalizing any claim, it’s worth running it through the same three questions a skeptical customer would ask:",
        ],
      },
      {
        type: "list",
        items: [
          ["Can we say exactly what was tested, documented, or sourced, not just the headline version?"],
          ["Do we know, and can we show, whether this came from internal testing or independent certification?"],
          ["If a customer clicked on this claim right now, would we have something real to show them, or would they hit a dead end?"],
        ],
      },
      {
        type: "paragraph",
        segments: [
          "If the honest answer to that third question is a dead end, the claim isn’t false. It’s just not ready to stand on its own yet.",
        ],
      },
      { type: "heading", text: "Documentation Is an Asset, Not Just a Compliance File" },
      {
        type: "paragraph",
        segments: [
          "Many brands treat testing summaries, sourcing records, and certifications purely as compliance artifacts: things that exist to satisfy a regulator or an auditor, then get filed away. That’s a missed opportunity. The same documentation that protects a brand legally is exactly what builds confidence commercially, if it’s made visible instead of archived. We cover the commercial side of this gap in ",
          { text: "Your Product Has 20 Things to Say", href: "/for-brands/resources/blog/product-has-20-things-to-say" },
          ".",
        ],
      },
      { type: "heading", text: "Building Claims Backward From Evidence" },
      {
        type: "paragraph",
        segments: [
          "The most defensible approach isn’t writing a claim and then hunting for evidence to support it. It’s the reverse: starting from what the brand can actually document, and writing claims that match exactly what that documentation shows. It’s a smaller shift than it sounds, and it tends to produce claims that are both more specific and more credible, because they were never stretched past what the evidence actually says.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "TruOrigin’s OriginCard structure makes this easier to maintain over time, because every claim on a product is directly tied to the specific evidence behind it, so if the evidence changes, the connection is already there to update.",
        ],
      },
      {
        type: "cta",
        text: "Want a second set of eyes on whether your current claims are as defensible as they could be?",
        linkText: bookDemo.text,
        href: bookDemo.href,
      },
    ],
  },
  {
    slug: "how-origincard-turns-documentation-into-trust",
    cluster: "origincard",
    category: "OriginCard",
    title: "How OriginCard Turns Product Documentation Into a Customer-Facing Asset",
    excerpt:
      "Most brands already have the raw material for customer confidence; it's just sitting in the wrong format. Here's how OriginCard changes that.",
    metaDescription:
      "See how OriginCard turns existing compliance documentation into a customer-facing information tool, without requiring brands to rebuild their records from scratch.",
    date: "Jun 11, 2026",
    isoDate: "2026-06-11",
    readTime: "6 min read",
    image: "/images/blogs/how-origincard-turns-documentation-into-trust.jpg",
    imageAlt: "A brand's compliance documentation being connected to customer-facing product claims through OriginCard",
    keywords: [
      "OriginCard ROI",
      "product documentation as marketing asset",
      "customer-facing documentation technology",
      "QR code product information tool",
      "brand credibility tools",
    ],
    content: [
      {
        type: "paragraph",
        segments: [
          "Most brands already have the raw material for customer confidence; it’s just sitting in the wrong format. A certificate of analysis convinces an auditor. It doesn’t, on its own, convince a shopper standing in an aisle with thirty seconds to decide. OriginCard exists to close that specific gap: turning documentation that was built for compliance into something that actually does commercial work.",
        ],
      },
      { type: "heading", text: "From Filed Away to Front and Center" },
      {
        type: "paragraph",
        segments: [
          "The typical lifecycle of a piece of product documentation looks like this: it gets created for a specific purpose (a regulatory filing, an internal QA check, a supplier agreement), it gets approved, and then it gets filed, rarely to be seen again outside of an audit. OriginCard changes what happens at that last step. Instead of filing, each piece of documentation gets connected to the exact claim it supports, and made available the moment a customer scans a product.",
        ],
      },
      { type: "paragraph", segments: ["Nothing about the underlying document changes. What changes is who can see it, and how easily."] },
      { type: "heading", text: "What This Actually Means for Customers" },
      {
        type: "paragraph",
        segments: [
          "This isn’t just a nicer way to display information. It changes the decision customers make in the moment. When someone can check a claim in a few taps instead of taking it on faith, three things tend to happen: they spend less time hesitating, they’re more likely to complete the purchase, and they’re more likely to come back, because the brand made itself easy to understand once already. This is the practical version of the concept we introduce in ",
          {
            text: "What If the Product Came With Its Own Information Card?",
            href: "/for-brands/resources/blog/what-if-product-had-its-own-information-card",
          },
          ".",
        ],
      },
      { type: "heading", text: "Built to Scale With What You Already Have" },
      {
        type: "paragraph",
        segments: [
          "Rolling out OriginCard doesn’t mean rebuilding a brand’s documentation from scratch. It means mapping what already exists (test results, certifications, sourcing records) to the claims already on the product, one SKU at a time. For most brands, the documentation work is already done. What’s been missing is the layer that makes it visible.",
        ],
      },
      {
        type: "cta",
        text: "Want to see what OriginCard would look like mapped to your own existing documentation?",
        linkText: bookDemo.text,
        href: bookDemo.href,
      },
    ],
  },
  {
    slug: "what-a-self-explaining-product-page-looks-like",
    cluster: "self-explaining-products",
    category: "Product Innovation",
    title: "What a Self-Explaining Product Page Actually Looks Like",
    excerpt:
      "It's one thing to say a product should explain itself. Here's the concrete version: what a customer actually sees when they scan.",
    metaDescription:
      "A concrete walkthrough of what a claim-by-claim, tap-to-expand product page looks like, and why it has to serve both quick shoppers and deep researchers.",
    date: "Jun 4, 2026",
    isoDate: "2026-06-04",
    readTime: "5 min read",
    image: "/images/blogs/what-a-self-explaining-product-page-looks-like.jpg",
    imageAlt: "A mobile screen showing a structured product page with tappable claims linked to evidence",
    keywords: [
      "interactive product page design",
      "self explaining product experience",
      "claim evidence product page",
      "QR code landing page product",
      "structured product information page",
    ],
    content: [
      {
        type: "paragraph",
        segments: [
          'It’s one thing to say a product should be able to "explain itself." It’s another to know what that actually looks like on a screen, the moment someone scans a QR code standing in front of the product. Here’s the concrete version.',
        ],
      },
      { type: "heading", text: "The Structure, Claim by Claim" },
      {
        type: "paragraph",
        segments: [
          'A self-explaining product page doesn’t open with a wall of text. It opens with the same claims already on the packaging: "Clinically Tested," "Third-Party Tested," "Sustainably Sourced," each one presented as something a customer can tap into individually, rather than a paragraph they’d need to read start to finish.',
        ],
      },
      {
        type: "paragraph",
        segments: [
          "Tapping a claim doesn’t dump a full lab report on the customer either. It surfaces a short, plain-language summary first (what was tested, by whom, and what the result was) with the option to go deeper into the actual documentation for anyone who wants it. This is the same claim-to-evidence structure described more conceptually in ",
          {
            text: "What If Every Product Could Explain Itself?",
            href: "/for-brands/resources/blog/what-if-every-product-could-explain-itself",
          },
          ".",
        ],
      },
      { type: "heading", text: "Built for Two Very Different Customers" },
      {
        type: "paragraph",
        segments: [
          "Some customers want reassurance in five seconds: a green checkmark, a certification badge, a one-line summary. Others want to actually read the ingredient sourcing notes or the full testing methodology before they feel confident enough to buy it. A self-explaining page has to serve both without forcing either one through the other’s path.",
        ],
      },
      {
        type: "paragraph",
        segments: [
          "That’s why the structure matters as much as the content: quick answers on the surface, real documentation one tap deeper, for whoever wants it.",
        ],
      },
      { type: "heading", text: "What This Replaces" },
      {
        type: "paragraph",
        segments: [
          "Without this structure, both types of customers are underserved. The five-second shopper gets a wall of text they’ll skip. The deep-diver gets a marketing paragraph with no real evidence behind it. A claim-by-claim, tap-to-expand structure, the model behind ",
          {
            text: "OriginCard",
            href: "/for-brands/resources/blog/how-origincard-turns-documentation-into-trust",
          },
          ", solves for both at once, because it doesn’t force a single reading path on every visitor.",
        ],
      },
      {
        type: "cta",
        text: "Want to see this structure built around your own product's actual claims?",
        linkText: bookDemo.text,
        href: bookDemo.href,
      },
    ],
  },
];

export function getBlogPosts(): BlogPost[] {
  return blogPosts;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(slug: string, limit = 4): BlogPost[] {
  const current = getBlogPostBySlug(slug);
  const others = blogPosts.filter((post) => post.slug !== slug);
  if (!current) return others.slice(0, limit);

  const sameCluster = others.filter((post) => post.cluster === current.cluster);
  const rest = others.filter((post) => post.cluster !== current.cluster);
  return [...sameCluster, ...rest].slice(0, limit);
}
