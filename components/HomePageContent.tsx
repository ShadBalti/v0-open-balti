import Link from "next/link"

export function HomePageContent() {
  return (
    <section className="prose mx-auto max-w-3xl text-muted-foreground mt-16">
      <h2 className="text-xl font-semibold">What is the Balti Language?</h2>
      <p>
        The <strong>Balti language</strong> is a Tibetic language spoken in the scenic mountains of Baltistan, a region
        in northern Pakistan. It is considered one of the most preserved forms of classical Tibetan, retaining ancient
        phonology and grammar. With deep cultural roots, the Balti language is a living heritage of the greater
        Himalayan region.
      </p>

      <h2 className="text-xl font-semibold">Explore the OpenBalti Digital Dictionary</h2>
      <p>
        <strong>OpenBalti Dictionary</strong> is a free and open-source platform designed to help users{" "}
        <strong>translate Balti to English</strong> and <strong>English to Balti</strong>. It’s built for students,
        researchers, native speakers, and anyone interested in
        <strong>preserving endangered languages</strong>. Our mission is to support language documentation, digital
        access, and community knowledge-sharing.
      </p>

      <h2 className="text-xl font-semibold">Why Balti Matters</h2>
      <ul>
        <li>One of the oldest spoken Tibetan dialects in the world</li>
        <li>Crucial for preserving the cultural identity of Baltistan</li>
        <li>Still spoken in Skardu, Shigar, Kharmang, and Ghanche</li>
        <li>Contains unique vocabulary not found in other Tibetan variants</li>
      </ul>

      <h2 className="text-xl font-semibold">Learn Balti Online for Free</h2>
      <p>
        Whether you're a linguist, a student of Himalayan culture, or someone reconnecting with your roots, OpenBalti
        provides a user-friendly experience to <strong>learn Balti online</strong>. Discover word meanings, suggested
        usage, and historical context for each entry.
      </p>

      <h2 className="text-xl font-semibold">Features of the OpenBalti Dictionary</h2>
      <ul>
        <li>Fast and responsive interface for desktop and mobile</li>
        <li>Real-time Balti word search and filtering by tags</li>
        <li>Community submissions with expert review</li>
        <li>Plans for audio pronunciation and sentence examples</li>
        <li>Future support for Roman script and native script</li>
      </ul>

      <h2 className="text-xl font-semibold">Technology Behind OpenBalti</h2>
      <p>
        This project is built using modern web technologies such as <strong>Next.js</strong>,
        <strong> TypeScript</strong>, and <strong>Tailwind CSS</strong>. It is fully open-source and hosted on Vercel.
        You can explore the code on{" "}
        <Link href="https://github.com/ShadBalti/openbalti" className="text-primary underline" target="_blank">
          GitHub
        </Link>{" "}
        and even contribute to our dictionary.
      </p>

      <h2 className="text-xl font-semibold">Contribute to Language Preservation</h2>
      <p>
        We believe language is culture. You can help keep Balti alive by{" "}
        <Link href="/contribute" className="text-primary underline">
          submitting words
        </Link>
        , fixing definitions, or sharing this platform. Every contribution adds value to this growing dictionary for the
        Balti-speaking community and beyond.
      </p>

      <h2 className="text-xl font-semibold">Stay Connected</h2>
      <p>
        Follow us on Twitter (
        <a href="https://twitter.com/ShadBalti" target="_blank" className="text-primary underline" rel="noreferrer">
          @openbalti
        </a>
        ) for updates, featured words, and community stories. Let’s build a stronger future for the Balti
        language—together.
      </p>
    </section>
  )
}
