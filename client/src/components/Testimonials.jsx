import { TestimonialsColumn } from "./ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "AuraFarm transformed my farming business. I now earn 45% more by selling directly to buyers without middlemen.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    name: "Rajesh Patel",
    role: "Cotton Farmer, Gujarat",
  },
  {
    text: "The price forecasting feature helped me decide the perfect time to sell my wheat. Incredible technology for farmers!",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    name: "Suresh Kumar",
    role: "Wheat Farmer, Punjab",
  },
  {
    text: "As a woman farmer, AuraFarm gave me confidence to negotiate better prices. The support team is amazing and always helpful.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    name: "Anita Devi",
    role: "Soybean Farmer, Maharashtra",
  },
  {
    text: "Real-time market prices on my phone changed everything. No more relying on middlemen for price information.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    name: "Mohammed Ismail",
    role: "Paddy Farmer, Karnataka",
  },
  {
    text: "The weather predictions integrated with market data help me plan my harvest perfectly. This is the future of farming.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    name: "Priya Sharma",
    role: "Vegetable Farmer, Haryana",
  },
  {
    text: "AuraFarm's community feature connected me with other farmers. We now share best practices and get better deals together.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    name: "Vikas Reddy",
    role: "Sugarcane Farmer, Andhra Pradesh",
  },
  {
    text: "Being able to see buyer demand in real-time helps me grow exactly what the market needs. Smart farming at its best.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    name: "Kavita Singh",
    role: "Fruit Farmer, Himachal Pradesh",
  },
  {
    text: "The platform's analytics showed me which crops give better returns. My income increased by 60% in just one season.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    name: "Arjun Nair",
    role: "Spice Farmer, Kerala",
  },
  {
    text: "AuraFarm made it easy to get fair prices for my produce. The transparency in pricing is a game-changer for all farmers.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    name: "Deepa Kaur",
    role: "Pulses Farmer, Rajasthan",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const Testimonials = () => {
  return (
    <section className="my-20 relative" id="testimonial">
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5">
            What Farmers Say
          </h2>
          <p className="text-center mt-5 opacity-75">
            Hear from farmers across India who transformed their farming with AuraFarm.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
