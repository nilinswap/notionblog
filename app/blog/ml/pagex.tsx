import BlogContainer from "../blog-container";
import Image from "next/image";

export default function Ml() {
    return (
      <BlogContainer>
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Pattern Detection & ML
        </h1>
        <div className="space-y-6 text-gray-700 text-lg">
          <p className="text-gray-700 text-lg">
            Machine Learning is kind of a raw, hands-off way of recognizing
            patterns—it finds patterns purely from data without much human
            guidance. Unlike traditional programming, where we design algorithms
            based on how we <i>think</i> the world works and generate data from
            that, ML works the other way around: it takes in data and figures
            out what patterns exist.
          </p>
          <p className="text-gray-700 text-lg">
            It&apos;s also more descriptive—it doesn&apos;t just say,{" "}
            <i>&quot;Here&apos;s a pattern,&quot;</i> but also explores different possible
            patterns, their certainty, and how tweaking the data can make
            pattern recognition more effective. Instead of manually crafting
            logic, ML is about letting the system <i>discover</i> and refine its
            own understanding.
          </p>
          <Image
            src="/ml_vs_traditional_primer.png"
            alt="ML"
            width={500}
            height={500}
          />
          <p className="text-gray-700 text-lg">
            But ML isn&apos;t just one thing—it comes in different flavors, each
            with its own way of recognizing and using patterns:
          </p>
          <p className="text-gray-700 text-lg">
            Learn by examples (aka Supervised learning) - Imagine teaching a kid
            how to recognize cats. You show them pictures labeled{" "}
            <i>&quot;This is a cat&quot;</i> and <i>&quot;This is not a cat&quot;</i>, and over
            time, they get better at telling the difference. That&apos;s
            supervised learning—where an ML model learns from labeled examples.
            For example, spam filters in email—trained on emails labeled as{" "}
            <i>&quot;spam&quot;</i> or <i>&quot;not spam&quot;</i>, so they can predict whether a new
            email is junk.
          </p>
          <p className="text-gray-700 text-lg">
            Find the Hidden Patterns (aka Unsupervised Learning) - Now, imagine
            dumping a bunch of photos in front of the kid without telling them
            what&apos;s what. Instead of identifying <i>&quot;cats&quot;</i>, they might
            start grouping pictures based on color, shape, or texture.
            That&apos;s unsupervised learning—it finds patterns without labels,
            just by looking at similarities in the data. E.g. Netflix
            recommendations—grouping users with similar tastes and suggesting
            what they might like next.
          </p>
          <p className="text-gray-700 text-lg">
            Trial-and-Error (aka Reinforcement Learning) - Think of a video game
            character learning to survive. At first, they randomly press
            buttons, but over time, they figure out what actions lead to rewards
            and which ones get them killed. Reinforcement learning works the
            same way—it learns by trying things, seeing what works, and
            improving over time. for example Self-driving cars—learning to
            navigate roads by making decisions and adjusting based on outcomes.
          </p>
          <p className="text-gray-700 text-lg">
            There is another semi-supervised but I neither understood it
            completely nor did I feel it&apos;s important. Any way!
          </p>
          <p className="text-gray-700 text-lg">
            At the end of the day, ML isn&apos;t some mysterious black box.
            It&apos;s just a very good pattern detector, trained on a boatload
            of data, making educated guesses about what comes next. In that
            case, it is worthwhile to discuss the patterns in Data as a next
            topic. Gotta work on that
          </p>
        </div>
      </BlogContainer>
    );
}