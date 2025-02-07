import BlogContainer from "../blog-container";
import Image from "next/image";

export default function Contrarian() {
  return (
    <BlogContainer>
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Where does the whole world disagree with me?</h1>
      <div className="space-y-6 text-gray-700 text-lg">
        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Cringe is ok</h2>
            <Image src="/cringe.jpeg" alt="Cringe is ok" width={500} height={500} />
            <p>
                If you are running towards something, you would be a cringe to the mass. That is not because cringe is so much required to get there, it is because
                you are not being cool. you are hardly even being yourself. you are trying to evolve too fast. people hate that shit.
            </p>
        </div>

        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">If I can slog my way through, then I am aiming too low</h2>
            <p>
                As a child, I grew up thinking that I need to be slogging and forcing myself to grind to get there. Or otherwise, I am not trying well enough. Unlearnt this the hard way that I <strong>need to enjoy the journey</strong> to get there. If I can coerce my way through, then I am aiming too low.
            </p>
        </div>
      </div>
    </BlogContainer>
  );
}

