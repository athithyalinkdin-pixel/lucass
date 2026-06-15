import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Leaf, Heart, ShieldCheck, Check, ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <div className="pt-0 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>About Us | Lucas Agro & Naturals</title>
      </Helmet>

      {/* Story Section */}
      <section className="py-32 bg-white relative overflow-hidden pt-40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
            {/* Image stack */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-secondary/20 rounded-[3rem] transform -rotate-3 scale-105" />
              <img
                src="https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&q=80&w=1000"
                className="relative z-10 rounded-[3rem] shadow-2xl object-cover aspect-square hover:scale-105 transition-transform duration-700"
                alt="Traditional Herbal Sourcing"
              />
            </motion.div>

            {/* Info Text */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-secondary font-bold uppercase tracking-[0.3em] text-xs mb-4 block flex items-center gap-2">
                <div className="w-8 h-[1px] bg-secondary" /> The Beginning
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-primary italic mb-8 leading-tight font-serif">
                Our Story
              </h2>
              <div className="space-y-6 text-primary/70 text-lg leading-relaxed font-medium">
                <p>
                  Modern lifestyle diseases like weight gain, sugar imbalance, and low energy are increasing rapidly. Finding safe, natural solutions can be challenging in a world of chemical-heavy alternatives.
                </p>
                <p>
                  We created Lucas Agro & Naturals to bridge the gap between ancient Ayurvedic principles and modern living. Our goal is simple: to support natural healing through time-tested Ayurvedic principles, standardized for today's lifestyle.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-bg-off-white">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary italic mb-6 font-serif">Our Core Values</h2>
            <p className="text-primary/60 text-lg max-w-2xl mx-auto font-medium">
              The principles that guide every product we create.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: 'Natural Healing',
                desc: 'Harnessing the power of pure herbs without synthetic additives.',
                icon: <Leaf size={32} />,
              },
              {
                title: 'Long-Term Wellness',
                desc: 'Focusing on sustainable health, not quick fixes.',
                icon: <Heart size={32} />,
              },
              {
                title: 'Safe & Sustainable',
                desc: 'Committed to ethical sourcing and safe consumption.',
                icon: <ShieldCheck size={32} />,
              },
            ].map((value, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                key={idx}
                className="bg-white p-12 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 group border border-transparent hover:border-secondary/20 text-center"
              >
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mx-auto mb-8 group-hover:bg-secondary group-hover:text-white transition-colors duration-500 shadow-sm">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-black text-primary italic mb-4 font-serif">{value.title}</h3>
                <p className="text-primary/60 leading-relaxed font-medium">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-32 bg-[#E8EFE9] relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform -translate-y-1/4 translate-x-1/4">
          <Leaf size={600} className="text-secondary" />
        </div>

        <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-secondary font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Our Purpose</span>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-primary text-white p-16 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-primary-light/10"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
              <h3 className="text-3xl font-black mb-6 italic text-secondary relative z-10 font-serif">Our Mission</h3>
              <p className="text-white/80 text-xl leading-relaxed italic relative z-10 font-medium">
                Deliver safe, natural, and effective solutions that empower you to take control of your health.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white text-primary p-16 rounded-[3rem] shadow-xl border border-secondary/20 relative overflow-hidden group"
            >
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
              <h3 className="text-3xl font-black mb-6 italic text-secondary relative z-10 font-serif">Our Vision</h3>
              <p className="text-primary/70 text-xl leading-relaxed italic relative z-10 font-medium">
                To become a trusted Ayurvedic wellness brand known for integrity, quality, and real results.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quality Standards Section */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left quality text */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-secondary font-bold uppercase tracking-[0.3em] text-xs mb-4 block flex items-center gap-2">
                <div className="w-8 h-[1px] bg-secondary" /> Uncompromising Quality
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-primary italic mb-6 leading-tight font-serif">
                Your safety is our priority. Every bottle meets rigorous standards.
              </h2>
              <div className="space-y-8 mt-12">
                {[
                  {
                    title: 'Strict Quality Checks',
                    desc: 'Multiple stages of testing for purity and potency.',
                  },
                  {
                    title: 'Standardized Herbal Blends',
                    desc: 'Consistent formulation in every batch.',
                  },
                  {
                    title: 'Certified Manufacturing',
                    desc: 'Produced in GMP and ISO certified facilities.',
                  },
                ].map((standard, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.2 }}
                    key={idx}
                    className="flex gap-6 items-start group"
                  >
                    <div className="w-14 h-14 bg-bg-off-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-secondary transition-colors duration-300 shadow-inner">
                      <Check className="text-secondary group-hover:text-white transition-colors duration-300" size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-primary mb-2 italic font-serif">{standard.title}</h4>
                      <p className="text-primary/60 font-medium text-sm leading-snug">{standard.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Quality image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1615840287214-7ff58936c4cf?auto=format&fit=crop&q=80&w=1000"
                className="rounded-[3rem] shadow-2xl object-cover aspect-[4/5] w-full hover:scale-105 transition-transform duration-700"
                alt="Quality Lab Manufacturing"
              />
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex items-center gap-6 hidden md:flex z-20">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <p className="font-black text-primary text-2xl mb-1">100%</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/40">Lab Tested</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust certifications list */}
      <section className="py-20 bg-bg-off-white relative border-y border-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary italic mb-4 font-serif">
              Certified Trust & <span className="text-secondary">Proven Quality</span>
            </h2>
            <div className="w-24 h-1 bg-secondary mx-auto rounded-full mb-8" />
            <p className="text-primary/60 max-w-2xl mx-auto font-medium">
              We uphold the highest standards of safety and purity. Every Lucas Agro & Naturals product is manufactured in certified facilities and undergoes rigorous testing.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {[
              { name: 'FSSAI', label: 'Food Safety', url: 'fssai_cert.png' },
              { name: 'GMP', label: 'Manufacturing', url: 'gmp_cert.jpg' },
              { name: 'ISO', label: 'Quality Mgmt', url: 'iso_cert.png' },
              { name: 'MSME', label: 'Govt Recognized', url: 'msme_cert.png' },
              { name: '100% Natural', label: 'Pure Product', url: 'natural_product.png' },
              { name: 'Trademark', label: 'Registered Brand', url: 'trademark_new.png' },
            ].map((cert, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -15, scale: 1.1 }}
                className="group relative flex flex-col items-center"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center p-6 border-2 border-accent/30 shadow-md transition-all duration-500 group-hover:shadow-secondary/30 group-hover:border-secondary overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={`/src/assets/${cert.url}`}
                    alt={cert.name}
                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                      e.target.src = `https://placehold.co/200x200?text=${cert.name}`;
                    }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{cert.name}</p>
                  <p className="text-[8px] font-bold text-secondary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    {cert.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="py-32 bg-[#2F5233] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?auto=format&fit=crop&q=80&w=2000')] opacity-5 mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black italic mb-6 leading-tight font-serif"
          >
            Experience the Natural Difference
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80 mb-12 leading-relaxed font-medium max-w-2xl mx-auto"
          >
            Join thousands of satisfied customers who trust Lucas Agro & Naturals for their wellness.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/shop"
              className="bg-white text-[#2F5233] px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 inline-flex items-center gap-3 group font-sans text-sm"
            >
              Shop Premium Solutions <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
