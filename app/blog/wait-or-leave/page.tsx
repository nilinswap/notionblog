import BlogContainer from "../blog-container";

export default function WaitOrLeave() {
  return (
    <BlogContainer>
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Wait or Leave</h1>
      <div className="space-y-6 text-gray-700 text-lg">
        <p>
          Our guy is waiting for someone on a dinner table. He is there on time
          but she is not there yet. It is the time of 1800&apos;s when one does
          not have cell phone. He waits, waits for 10 minutes, waits for 30
          minutes and now He is considering leaving. He travelled some long
          distance for this night and he was really looking upto this. At every
          other minute, He is faced with a question - wait or leave? Leave -
          because she should have been here an hour ago, if she were to be
          present at all so she is not coming but wait, &apos;wait&apos; -
          because assuming she is coming, if she is already an hour late, she
          must really be getting here any next minute, I mean, how much more can
          anyone get late? Quite a conflict, is not it? should have been here an
          hour ago, if she were to be present at all so she is not coming but
          wait, &apos;wait&apos; - because assuming she is coming, if she is
          already an hour late, she must really be getting here any next minute,
          I mean, how much more can anyone get late? Quite a conflict, is not
          it?
        </p>
        <p>
          I will try to answer this question later but let&apos;s just
          understand the problem by projecting it to a simpler problem. Imagine
          you are playing a flip-coin game with your friend, Jason. Your friend
          flips an unbiased coin before which he asks you to guess the result,
          if you are right, he gives you a candy and if you are wrong, you give
          him a candy. This is repeated, say, for 10 times. That is the game for
          you. Although statistically, it is a zero-sum game but with so little
          number of trials the chances of it being a zero-sum at the end is not
          too high(~0.25). Problem is - suppose, from start, you got a six
          straight streak of heads, what is your guess for the next flip? I hear
          myself say &apos;Tails.&apos;
        </p>
        <p>
          Let&apos;s take another case, India faced last plane crash in 2010 and
          there are total 6000 flights that take off everyday. So being humble
          and taking 1000 flights per day as an average number for 10 years
          period, that is more than 3.5 Million flights since the last plane
          crash. This is like 3.5 Million trials in the flip-coin example with
          an important difference, the coin is not unbiased.
        </p>
        <p>
          So is it statistically safe to fly domestically in India, say,
          tomorrow?
        </p>
        <p>
          In both examples, every trial is independent. The difference, however
          lies in probability of success. In these cases, previous events&apos;
          outcome do not make a difference. Probability of success remains same
          at that instant so one can&apos;t really say much.
        </p>
        <p>
          Let&apos;s take another example - An investor invested some money in
          company stocks that looked promising initially but now it&apos;s price is
          falling rapidly and investor can see his loss. what should he do now?
          - wait for a bump up or escape this defeatedly? This is a true risk
          because there is no guarantee of success here. A company can just
          diminish in its loss taking down all the money investor invested. this
          is a different case because every trial is not independent. Here, past
          events&apos; outcomes factor in and probability is ever-changing, following
          a curve. Here question is real - wait or leave?
        </p>
        <p>
          So what should our guy do? It is complex problem considering the
          probability that she would even come and a distribution of
          probabilities over her time of arrival. In short, he should wait if he
          is idle and desperate, until, he marks her being this late as a
          bizarre outlier. I really could not help in this discussion, I know.
        </p>
        <p>
          While he is thinking all this on the table, he comes back to the
          reality. Feeling rather sad, he unfolds the message and reads it again
          and for the last time. He finds himself too weak to read it fully and
          sticks out the card onto the flame of candle laid on the table. As he
          is passed out in his thoughts and card is burning, he notices the
          address of restaurant and finds it different. He blows out the flame
          to read the address again but he finds that part already burnt. He is
          in a turmoil and finally leaves.
        </p>
        <p className="text-center italic">The End</p>
      </div>
    </BlogContainer>
  );
}
