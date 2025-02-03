import Image from "next/image";

const BlogPost = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative mt-4 max-w-3xl mx-auto rounded-2xl p-[3px] bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
        <div className="bg-white rounded-xl p-8 sm:p-12">
          <article className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">
              Nature is Dissipative
            </h1>

            <div className="space-y-6 text-gray-700 text-lg">
              <p>
                Waste may mean different to different people. To vegans, rearing
                animals for food is a waste (of life); to non-vegans, life
                living as a vegan itself is a waste. In this article, I would
                mean waste in a more general sense but even that might mean
                different in future. For example, Noble Peace Prize's denial to
                Mahatma Gandhi is wasteful now since so many later prize
                lauretes got inspired by him.
              </p>

              <p>
                Franz Kafka's work was considered a waste until he became a
                super-star after he died. Kafka is the best way to begin this
                idea. He became popular for a litrerary figure called Kafkaesque
                which is quite coherent with this article. Some men compared him
                with Dante. This is despite the fact that he burned 90% of his
                work before he died and the rest of his work, he gave to his
                friend saying - "I could not destroy these, would you please do
                it?". Thankfully, his friend did not agree and published his
                work, giving us Kafkaesque. What a waste, right?
              </p>

              <div className="my-8 flex justify-center">
                <Image
                  src="/goghcafe.jpeg"
                  alt="Van Gogh's Cafe"
                  className="rounded-lg shadow-lg max-w-full h-auto"
                  width={500}
                  height={500}
                />
              </div>

              <p>
                But he is not the only one with a life like this, Vincent Van
                Gogh had a similar life. He started painting very late in his
                life and he supposedly shot himself in chest, at the age of 37.
                He lived his life being dissatisfied with his work and thought
                he is terrible at painting. Whole of his life he awaited
                appreciation for his paintings, probably a factor in his
                suicide. Ramanujan, One of the greatest mathematicians, died at
                the age of 32 while seeking acknowledgement for his work.
                Évariste Galois, another great mathematician, died at the age of
                20 by when he had already founded the fundamentals of encryption
                science. He died in a duel fight. Mozart died at the age of 31
                in poverty and thinking that he could never fill the shoes of
                Beethoven. Steve Jobs was kept 12 years away from Apple before
                he went on to release iconic products which turned it into the
                most valuable company before he died. Simon and Garfunkel
                produced some of my favourite songs. They broke up their duo
                shortly after the success and never wrote a song together. They
                composed only 5 albums for which they won 10 Grammy Awards. This
                list is a string from a bottom-less well of waste. It sucks to
                think all of this.
              </p>

              <p>
                Nature is dissipative. Beethoven lived a full-sized life and
                produced many great works but only some of them were recreated
                and it is almost 200 years since he died. (Also true for
                mozart.) We simply don't have apetite to consume so much music.
                India made so much effort to provide education to poor children
                and then Coronavirus hit and now it is feared that one full
                generation may miss on education, simply because poor parents
                dropped their kids out of school and are making them to work in
                fields for money. Think of it, We sleep one third of our life
                off, pay a large fraction of money as tax, keep connection with
                so many people until we finally let go of them and so on. Nature
                is inherently dissipative; it plays survival-of-the-fittest game
                all the time. Chaos is naturally ensued and conquering every
                extra percent in control requires exponentially more resources.
                All of this to say - it is okay to be wasted. It is okay to
                dissipate some money, time, passion, life etc. It is okay to
                make mistakes because one way or the other, nature will snatch
                some part of you. This is a firefly in the dark.
              </p>

              <p className="text-center italic">The End</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
