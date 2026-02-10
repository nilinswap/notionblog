import BlogContainer from "../blog-container";
import Image from "next/image";

export default function Contrarian() {
  return (
    <BlogContainer>
      <h1 className="text-4xl font-bold mb-8 text-gray-900">
        Where does the whole world disagree with me?
      </h1>
      <div className="space-y-6 text-gray-700 text-lg">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Smartness is a state, not a trait
          </h2>
          <p>
            If smartness is defined as the player&apos;s probability to succeed
            in the game then it must likely be a state. Here I differ it from
            strength. Strength is an attribute (at least, in short term), not a
            state. Things like experience, knowledge etc go in strength bucket.
            Smartness, in its most general and practical sense, is the ability
            to find out what to do next and to execute it the best way suited
            for that person.
          </p>
          <p>
            &quot;Sure, you are smart, then why haven&apos;t you figured it
            out?&quot;
          </p>
          <p>
            Smartness as ability to learn, adapt and execute is really a
            breakdown of three things — Knowing what matters (and hence what to
            do), figuring out how to do, and to just &quot;do.&quot; Here is the
            meat — for a player who is playing seriously, he almost always has
            some idea about what he should do. Most people see 100s of
            possible ways and remains confused on what to choose. A smart person
            is able to sift through the sea of options and find 2-3 logical
            obvious moves. This is only possible if he is `focused` and
            `fearless`. And both focus and fearlessness, are states. Next —
            planning — I feel it plays a very small role in the success.
            adaptability is more important. A smart person know when to slow
            down and turn. Adaptability is again a state — if you are open,
            unbiased of the past or your identity, you are adaptable. And, last
            part — execution — is really a game of confidence. You know what to
            do, you made some shit plan but you know you will be able to fix it
            on the go.. and you are confident that you can follow through the
            path &quot;easily.&quot;
          </p>
          <p>
            Whenever I found myself being stupid I was either scared or I lacked
            belief.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Sales is mostly a pressure game
          </h2>
          <p>
            Most sales books and courses teach you to be consultative, helpful,
            and value adding. While that holds true at at a much higher-level,
            at ground-level, you are always fighting against inertia. Most
            people don&apos;t want to change. They are comfortable with the
            status-quo. They don&apos;t want to take risks with a new product,
            even when they realise that they don&apos;t like the current
            product. One needs to jerk them out into action. That is why there
            are flash sales, limited period offers, and discounts etc.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Humility is overrated
          </h2>
          <p>
            I think humility is one of the most important virtues to have and is
            often seriously lacking in heros of many failure stories. But, I
            think it is also a serious reason for a lot of mediocrity. While, we
            see lack of humility in a lot of failure stories and feel good. but
            most successful people (even when they don&apos;t show it), have a
            strong sense of pride and confidence in themselves (often to the
            point of arrogance). Similarily, most of common people are humble to
            a fault. &quot;Only if one thinks that they are capable of great
            things, they can actually do great things&quot; - is so
            cliche&apos;. Those who slog for humility often miss out on great
            returns which requires one to get of that slog-race and take bold
            actions. Has it ever happened that you saw an arrogant person
            blabbering about how good he is and somewhere know, he will topple
            on the floor soon - then see them again and see them doing better? -
            well, you wer right, he did topple.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Cringe is ok
          </h2>
          <Image
            src="/cringe.jpeg"
            alt="Cringe is ok"
            width={500}
            height={500}
          />
          <p>
            If you are running towards something, you would be a cringe to the
            mass. That is not because cringe is so much required to get there,
            it is because you are not being cool. you are hardly even being
            yourself. you are trying to evolve too fast. people hate that shit.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            No Pain, Infinite Gain
          </h2>
          <p>
            While No-pain-no-gain is true at a much ground-level, it is easy to
            confuse sacrifice with being bold. As a child, I grew up thinking
            that I need to be slogging and forcing myself to grind to get there.
            Or otherwise, I am not trying well enough. Unlearnt this the hard
            way that I <strong>need to enjoy the journey</strong> to get there.
            If I can coerce my way through, then I am aiming too low.
          </p>
        </div>
      </div>
    </BlogContainer>
  );
}

