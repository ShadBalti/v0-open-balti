import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Globe, Heart, Mic, Search, PlusCircle, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { FAQStructuredData } from "./structured-data"

const features = [
  {
    icon: BookOpen,
    title: "Comprehensive Dictionary",
    description: "Thousands of Balti words with English translations, pronunciations, and cultural context",
  },
  {
    icon: Mic,
    title: "Audio Pronunciations",
    description: "Learn correct pronunciation with native speaker audio recordings",
  },
  {
    icon: Globe,
    title: "Dialect Variations",
    description: "Explore different Balti dialects from various regions of Baltistan",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Built by native speakers and language enthusiasts working together",
  },
  {
    icon: Search,
    title: "Advanced Search",
    description: "Find words by meaning, pronunciation, dialect, or difficulty level",
  },
  {
    icon: Heart,
    title: "Cultural Preservation",
    description: "Preserving the rich linguistic heritage of the Balti people",
  },
]

const stats = [
  { label: "Dictionary Entries", value: "5,000+" },
  { label: "Active Contributors", value: "150+" },
  { label: "Dialects Covered", value: "8" },
  { label: "Audio Recordings", value: "2,500+" },
]

const testimonials = [
  {
    name: "Dr. Amina Khan",
    role: "Linguist, University of Baltistan",
    content:
      "OpenBalti Dictionary is an invaluable resource for preserving our linguistic heritage. The community-driven approach ensures authenticity and cultural accuracy.",
    rating: 5,
  },
  {
    name: "Mohammad Ali",
    role: "Balti Language Teacher",
    content:
      "I use this dictionary daily in my classes. The pronunciation guides and cultural context help my students understand not just words, but our culture.",
    rating: 5,
  },
  {
    name: "Sarah Thompson",
    role: "Researcher, Oxford University",
    content:
      "An excellent resource for academic research on Tibetic languages. The etymological information and dialect variations are particularly valuable.",
    rating: 5,
  },
]

const faqs = [
  {
    question: "How accurate are the translations in the OpenBalti Dictionary?",
    answer:
      "All translations are reviewed by native Balti speakers and linguistic experts. We have a community verification system where multiple contributors validate each entry to ensure accuracy and cultural appropriateness.",
  },
  {
    question: "Can I contribute even if I'm not a native Balti speaker?",
    answer:
      "Yes! We welcome contributions from language learners, researchers, and enthusiasts. However, all contributions are reviewed by native speakers before being published to maintain accuracy.",
  },
  {
    question: "How do you handle different Balti dialects?",
    answer:
      "We recognize and document various Balti dialects including Skardu, Khaplu, Shigar, and others. Each word entry is tagged with its specific dialect, and we show variations when they exist.",
  },
  {
    question: "Is there a mobile app for the OpenBalti Dictionary?",
    answer:
      "Currently, we offer a mobile-responsive web application. A dedicated mobile app is in development and will be available soon for both iOS and Android platforms.",
  },
]

export function HomePageContent() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="relative mx-auto w-full max-w-2xl">
          <Image
            src="/baltistan.jpeg"
            alt="Beautiful landscape of Baltistan showing mountains and traditional architecture, representing the homeland of the Balti language"
            width={800}
            height={400}
            className="rounded-lg object-cover w-full h-64 md:h-80"
            priority
          />
          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
            <div className="text-white text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold">Preserve. Learn. Share.</h2>
              <p className="text-lg">The Balti language for future generations</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/contribute">
              <PlusCircle className="mr-2 h-5 w-5" />
              Start Contributing
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/about">Learn More About Balti</Link>
          </Button>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Features */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Why Choose OpenBalti Dictionary?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the comprehensive features that make learning and preserving the Balti language accessible to
            everyone
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* About Balti Language */}
      <section className="bg-muted/50 rounded-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">About the Balti Language</h2>
          <p className="text-muted-foreground">Understanding the rich heritage of Balti</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-lg">
              Balti is a Tibetic language spoken by approximately 400,000 people primarily in the Baltistan region of
              Pakistan and parts of Ladakh, India. It belongs to the Sino-Tibetan language family and shares linguistic
              roots with Tibetan.
            </p>
            <p>
              The language has several dialects including Skardu, Khaplu, Shigar, and others, each with unique
              characteristics while maintaining mutual intelligibility. Balti has traditionally been written in the
              Tibetan script, though Arabic and Latin scripts are also used.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Sino-Tibetan Family</Badge>
              <Badge variant="secondary">400,000+ Speakers</Badge>
              <Badge variant="secondary">8 Major Dialects</Badge>
              <Badge variant="secondary">3 Writing Systems</Badge>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Key Characteristics</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Tonal language with complex verb conjugations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Rich vocabulary for describing mountain geography</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Strong influence from Persian and Arabic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Oral tradition with extensive folklore</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Cultural significance in Balti identity</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">What Our Community Says</h2>
          <p className="text-muted-foreground">Trusted by educators, researchers, and language enthusiasts</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-base italic">"{testimonial.content}"</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Everything you need to know about the OpenBalti Dictionary</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{faq.answer}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center space-y-6 bg-primary/5 rounded-lg p-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Join Our Mission</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Help us preserve the Balti language for future generations. Every contribution, no matter how small, makes a
            difference in keeping this beautiful language alive.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/signup">
              <Users className="mr-2 h-5 w-5" />
              Join the Community
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/contributors">Meet Our Contributors</Link>
          </Button>
        </div>
      </section>

      <FAQStructuredData faqs={faqs} />
    </div>
  )
}
