import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  return (
    <div className="pt-32 pb-24 bg-bg-off-white min-h-screen">
      <Helmet>
        <title>Privacy Policy | Lucas Agro & Naturals</title>
      </Helmet>
      <div className="container mx-auto px-4 max-w-4xl glass-card p-12">
        <h1 className="text-4xl font-bold text-primary mb-8 italic">Privacy Policy</h1>
        <div className="prose prose-primary max-w-none text-primary/80">
          <p className="mb-6">At Lucas Agro & Naturals, we are committed to protecting your privacy in accordance with the Digital Personal Data Protection (DPDP) Act 2023.</p>
          
          <h3 className="text-xl font-bold text-primary mt-8 mb-4">1. Information We Collect</h3>
          <p className="mb-6">We collect your name, email, phone number, and shipping address when you place an order.</p>
          
          <h3 className="text-xl font-bold text-primary mt-8 mb-4">2. How We Use Your Information</h3>
          <p className="mb-6">Your data is used solely for processing orders, communicating updates, and improving our services.</p>
          
          <h3 className="text-xl font-bold text-primary mt-8 mb-4">3. Data Security</h3>
          <p className="mb-6">We implement industry-standard security measures to protect your personal data.</p>

          <h3 className="text-xl font-bold text-primary mt-8 mb-4">4. Your Data Rights (DPDP Act 2023)</h3>
          <p className="mb-4">As a data principal under the DPDP Act 2023, you have the following rights regarding your personal data:</p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Right to Access:</strong> Request a copy of your personal data processed by us.</li>
            <li><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete data.</li>
            <li><strong>Right to Erasure:</strong> Request deletion of your data when no longer necessary.</li>
            <li><strong>Right to Portability:</strong> Request transfer of your data to another service.</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw your consent for data processing at any time.</li>
          </ul>

          <h3 className="text-xl font-bold text-primary mt-8 mb-4">5. Grievance Officer</h3>
          <p className="mb-4">For any privacy concerns, complaints, or exercise of your rights, please contact our Grievance Officer:</p>
          <div className="bg-primary/5 p-6 rounded-2xl mb-6">
            <p><strong>Email:</strong> privacy@lucasagro.com</p>
            <p><strong>Address:</strong> Lucas Agro & Naturals, Chennai, Tamil Nadu, India</p>
            <p><strong>Response Time:</strong> Within 72 hours</p>
          </div>

          <h3 className="text-xl font-bold text-primary mt-8 mb-4">6. Data Retention</h3>
          <p className="mb-6">We retain your data only as long as necessary for the purposes outlined in this policy or as required by law.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
