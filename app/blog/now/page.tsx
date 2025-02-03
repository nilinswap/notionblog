import BlogContainer from "../blog-container";

export default function Now() {
  return (
    <BlogContainer>
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Now</h1>
      <div className="space-y-6 text-gray-700 text-lg">
        <p>
          I am a software developer at Linkedin stationed in Bangalore and
          currently working from home. I am staying at my home in Wardha.
        </p>
        <p>
          I am currently working on my writing. I am reading (actually, trying
          to read) two books - 'Freakonomics' and 'Thinking Fast and Slow.'
        </p>
        <p>I am learning to play 'I Giorni' and mariage D'amour.</p>
        <p>
          I like to meet people so I am using this time to connect with a lot
          of my lost friends. And I am thinking.
        </p>
      </div>
    </BlogContainer>
  );
}

