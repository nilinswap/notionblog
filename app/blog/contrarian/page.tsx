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
            Sales is mostly a pressure game
          </h2>
          <p>
            Most sales books and courses teach you to be consultative, helpful,
            and value adding. While that holds true at at a much higher-level, at ground-level, you are always fighting against inertia.
            Most people don't want to change. They are comfortable with the
            status-quo. They don't want to take risks with a new product, even when they realise that they don't like the current product. One needs to jerk them out into action.
            That is why there are flash sales, limited period offers, and discounts etc. 
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Humility is overrated
          </h2>
          <p>
            I think humility is one of the most important virtues to have and is often seriously lacking in heros of many failure stories. 
            But, I think it is also a serious reason for a lot of mediocrity. While, we see lack of humility in a lot of failure stories and feel good.
            but most successful people (even when they don't show it), have a strong sense of pride and confidence in themselves (often to the point of arrogance). Similarily, most of common people are humble to a fault.
            "Only if one thinks that they are capable of great things, they can actually do great things" - is so cliche'. Those who slog for humility often miss out on great returns which requires one to get of that slog-race and take bold actions. 
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
            If I can slog my way through, then I am aiming too low
          </h2>
          <p>
            As a child, I grew up thinking that I need to be slogging and
            forcing myself to grind to get there. Or otherwise, I am not trying
            well enough. Unlearnt this the hard way that I{" "}
            <strong>need to enjoy the journey</strong> to get there. If I can
            coerce my way through, then I am aiming too low.
          </p>
        </div>
      </div>
    </BlogContainer>
  );
}

