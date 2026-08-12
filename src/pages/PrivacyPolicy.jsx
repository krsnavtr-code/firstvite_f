import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const PrivacyPolicy = () => {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen mt-10 bg-gray-50 dark:bg-slate-900">
      <SEO 
        title="Privacy Policy | Eklabya Centre of Excellence"
        description="Read the Privacy Policy of Eklabya Centre of Excellence to understand how we collect, use, and protect your personal information securely."
        keywords="privacy policy, data protection, personal information, Eklabya privacy, online learning privacy, data security"
        og={{
          title: 'Privacy Policy | Eklabya Centre of Excellence',
          description: `Last updated ${lastUpdated}. Learn how Eklabya Centre of Excellence protects your privacy and handles your personal information.`,
          type: 'article'
        }}
      />
      <div className="pb-16 px-2">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg p-1.5">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Last updated: August 12, 2026
          </p>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-black dark:text-white">
            <p>
              This Privacy Notice for Eklabya ("we," "us," or "our") describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Visit our website or any website of ours that links to this Privacy Notice.</li>
              <li>
                Use our Products and Services. Eklabya provides online and professional learning programs, certification courses, career-oriented training, and related educational services. These may include programs in areas such as Data Science, Artificial Intelligence, Data Analytics, Full Stack Development, Cyber Security, Programming, SAP, and other professional skill-development domains. Personal information may be collected and processed when users browse our website, enquire about a program, register for a course, make a payment, participate in training, or request career-related support.
              </li>
              <li>Engage with us in other related ways, including any marketing or events.</li>
            </ul>

            <p>
              <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:info@eklabya.com" className="text-blue-600 dark:text-blue-400 underline">info@eklabya.com</a>.
            </p>

            {/* Summary of Key Points */}
            <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                SUMMARY OF KEY POINTS
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This summary provides key points from our Privacy Notice. You can find more details about each topic in the relevant sections below.
              </p>
              <ul className="space-y-3 text-sm">
                <li><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.</li>
                <li><strong>Do we process any sensitive personal information?</strong> We do not knowingly process sensitive personal information.</li>
                <li><strong>Do we collect any information from third parties?</strong> We may collect information from public databases, marketing partners, social media platforms, and other outside sources where applicable.</li>
                <li><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, maintain security and prevent fraud, and comply with applicable laws. We may also process your information for other purposes where permitted by law or with your consent, as applicable.</li>
                <li><strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties as described in this Privacy Notice.</li>
                <li><strong>How do we keep your information safe?</strong> We maintain appropriate organisational and technical processes and procedures designed to protect your personal information. However, no electronic transmission over the Internet or information storage technology can be guaranteed to be completely secure.</li>
                <li><strong>What are your rights?</strong> Depending on where you are located, applicable privacy laws may provide you with certain rights regarding your personal information.</li>
                <li><strong>How do you exercise your rights?</strong> You may exercise applicable privacy rights by contacting us at info@eklabya.com. We will consider and act upon requests in accordance with applicable data protection laws.</li>
              </ul>
            </div>

            {/* Table of Contents */}
            <div className="border-l-4 border-blue-600 pl-4 my-6 space-y-1 text-sm">
              <h3 className="font-bold text-lg mb-2">TABLE OF CONTENTS</h3>
              <p><a href="#section-1" className="text-blue-600 dark:text-blue-400 hover:underline">1. What Information Do We Collect?</a></p>
              <p><a href="#section-2" className="text-blue-600 dark:text-blue-400 hover:underline">2. How Do We Process Your Information?</a></p>
              <p><a href="#section-3" className="text-blue-600 dark:text-blue-400 hover:underline">3. When and With Whom Do We Share Your Personal Information?</a></p>
              <p><a href="#section-4" className="text-blue-600 dark:text-blue-400 hover:underline">4. Do We Use Cookies and Other Tracking Technologies?</a></p>
              <p><a href="#section-5" className="text-blue-600 dark:text-blue-400 hover:underline">5. Is Your Information Transferred Internationally?</a></p>
              <p><a href="#section-6" className="text-blue-600 dark:text-blue-400 hover:underline">6. How Long Do We Keep Your Information?</a></p>
              <p><a href="#section-7" className="text-blue-600 dark:text-blue-400 hover:underline">7. How Do We Keep Your Information Safe?</a></p>
              <p><a href="#section-8" className="text-blue-600 dark:text-blue-400 hover:underline">8. Do We Collect Information From Minors?</a></p>
              <p><a href="#section-9" className="text-blue-600 dark:text-blue-400 hover:underline">9. What Are Your Privacy Rights?</a></p>
              <p><a href="#section-10" className="text-blue-600 dark:text-blue-400 hover:underline">10. Controls for Do-Not-Track Features</a></p>
              <p><a href="#section-11" className="text-blue-600 dark:text-blue-400 hover:underline">11. Do We Make Updates to This Notice?</a></p>
              <p><a href="#section-12" className="text-blue-600 dark:text-blue-400 hover:underline">12. How Can You Contact Us About This Notice?</a></p>
              <p><a href="#section-13" className="text-blue-600 dark:text-blue-400 hover:underline">13. How Can You Review, Update, or Delete the Data We Collect From You?</a></p>
            </div>

            {/* Section 1 */}
            <h2 id="section-1" className="text-2xl font-semibold mt-8 mb-4">
              1. WHAT INFORMATION DO WE COLLECT?
            </h2>
            <p className="italic text-gray-600 dark:text-gray-300 mb-2">Personal Information You Disclose to Us</p>
            <p className="mb-4">
              <strong>In Short:</strong> We collect personal information that you voluntarily provide to us.
            </p>
            <p className="mb-4">
              We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, participate in activities on the Services, or otherwise contact us.
            </p>
            <h3 className="font-bold text-lg mt-4 mb-2">Personal Information Provided by You</h3>
            <p className="mb-2">
              The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Names</li>
              <li>Phone numbers</li>
              <li>Email addresses</li>
              <li>Mailing addresses</li>
              <li>Contact preferences</li>
            </ul>
            <h3 className="font-bold text-lg mt-4 mb-2">Sensitive Information</h3>
            <p className="mb-4">We do not knowingly process sensitive personal information.</p>
            <p className="mb-4">
              All personal information that you provide to us should be true, complete, and accurate, and you should notify us of any changes to such personal information.
            </p>
            <h3 className="font-bold text-lg mt-4 mb-2">Google API</h3>
            <p className="mb-4">
              Where applicable, our use of information received from Google APIs will adhere to the Google API Services User Data Policy, including applicable Limited Use requirements.
            </p>
            <h3 className="font-bold text-lg mt-4 mb-2">Information Collected From Other Sources</h3>
            <p className="mb-2">
              <strong>In Short:</strong> We may collect limited data from public databases, marketing partners, and other outside sources where applicable.
            </p>
            <p className="mb-4">
              To enhance our ability to provide relevant marketing, offers, and services and update our records, we may obtain information about you from other sources, such as public databases, marketing partners, affiliate programs, data providers, social media platforms, and other third parties, where permitted by applicable law.
            </p>
            <p className="mb-4">
              Such information may include mailing addresses, job titles, email addresses, phone numbers, Internet Protocol (IP) addresses, social media profiles or URLs, intent data, user behaviour data, and other information made available to us through legitimate sources.
            </p>

            {/* Section 2 */}
            <h2 id="section-2" className="text-2xl font-semibold mt-8 mb-4">
              2. HOW DO WE PROCESS YOUR INFORMATION?
            </h2>
            <p className="mb-4">
              <strong>In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, maintain security and prevent fraud, and comply with applicable laws.
            </p>
            <p className="mb-2">
              We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>To facilitate account creation and authentication and otherwise manage user accounts.</strong> We may process your information so you can create and log in to your account and keep your account functioning properly.</li>
              <li><strong>To provide and administer our educational Services.</strong> We may use your information to process course enquiries, registrations, enrolments, payments, training participation, certificates, and related support.</li>
              <li><strong>To communicate with you.</strong> We may use your contact information to respond to enquiries, provide service-related communications, and, where permitted, send marketing or promotional communications.</li>
              <li><strong>To improve our Services.</strong> We may analyse information to understand how users interact with our website and educational Services and to improve their functionality and user experience.</li>
              <li><strong>To maintain security and prevent fraud.</strong> We may process information to protect our website, users, systems, and Services.</li>
              <li><strong>To comply with legal obligations.</strong> We may process information where necessary to comply with applicable laws, regulations, legal processes, or governmental requests.</li>
              <li><strong>For other purposes</strong> permitted by applicable law or with your consent, where required.</li>
            </ul>

            {/* Section 3 */}
            <h2 id="section-3" className="text-2xl font-semibold mt-8 mb-4">
              3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
            </h2>
            <p className="mb-4">
              <strong>In Short:</strong> We may share information in specific situations described in this section and/or with relevant third parties.
            </p>
            <p className="mb-2">We may need to share your personal information in the following situations:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, acquisition, restructuring, or transfer of all or a portion of our business.</li>
              <li><strong>Service Providers.</strong> We may share information with third-party service providers who assist us with hosting, technology, analytics, payment processing, communications, customer support, security, or other business operations.</li>
              <li><strong>Legal Requirements.</strong> We may disclose information where required to comply with applicable laws, regulations, legal processes, court orders, or governmental requests.</li>
              <li><strong>Protection of Rights and Safety.</strong> We may disclose information where reasonably necessary to protect the rights, property, safety, or security of Eklabya, our users, or others.</li>
              <li><strong>With Your Consent.</strong> We may share information with other parties where you have provided appropriate consent or otherwise instructed us to do so.</li>
            </ul>
            <p className="mb-4">
              We do not sell personal information except where such activity is expressly permitted by applicable law and appropriately disclosed.
            </p>

            {/* Section 4 */}
            <h2 id="section-4" className="text-2xl font-semibold mt-8 mb-4">
              4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
            </h2>
            <p className="mb-4">
              <strong>In Short:</strong> We may use cookies and other tracking technologies to collect and store information when you interact with our Services.
            </p>
            <p className="mb-4">
              We may use cookies and similar tracking technologies, such as web beacons and pixels, to gather information when you interact with our Services.
            </p>
            <p className="mb-2">These technologies may help us:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Maintain the security of our Services</li>
              <li>Prevent crashes and technical problems</li>
              <li>Fix bugs</li>
              <li>Save user preferences</li>
              <li>Support basic website functionality</li>
              <li>Understand website usage and performance</li>
              <li>Measure advertising and marketing performance, where applicable</li>
            </ul>
            <p className="mb-4">
              We may also permit third parties and service providers to use tracking technologies on our Services for analytics and advertising purposes, where applicable. Where required by applicable law, users may be provided with options to manage or refuse certain non-essential cookies and tracking technologies.
            </p>
            <h3 className="font-bold text-lg mt-4 mb-2">Google Analytics</h3>
            <p className="mb-4">
              Where Google Analytics is used on our Services, we may use it to understand and analyse website usage, traffic, and user interactions. Google Analytics may collect information such as device information, IP-related information, browser information, pages visited, and interactions with our Services, subject to Google's applicable policies and configuration. Users may manage certain Google advertising and analytics preferences through Google's available privacy and advertising controls.
            </p>

            {/* Section 5 */}
            <h2 id="section-5" className="text-2xl font-semibold mt-8 mb-4">
              5. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?
            </h2>
            <p className="mb-4">
              <strong>In Short:</strong> Your information may be transferred to, stored, or processed in countries other than the country in which you reside, depending on the services and technology providers we use.
            </p>
            <p className="mb-4">
              Personal information may be processed by Eklabya or by third-party service providers in locations outside your country. Where personal information is transferred internationally, we will take appropriate measures to protect such information in accordance with applicable privacy laws and this Privacy Notice.
            </p>

            {/* Section 6 */}
            <h2 id="section-6" className="text-2xl font-semibold mt-8 mb-4">
              6. HOW LONG DO WE KEEP YOUR INFORMATION?
            </h2>
            <p className="mb-4">
              <strong>In Short:</strong> We keep your information for as long as necessary to fulfil the purposes outlined in this Privacy Notice unless a longer retention period is required or permitted by law.
            </p>
            <p className="mb-4">
              We will retain your personal information only for as long as it is necessary for the purposes described in this Privacy Notice, unless a longer retention period is required or permitted by law, including for tax, accounting, legal, fraud-prevention, or other legitimate business requirements.
            </p>
            <p className="mb-4">
              When we have no ongoing legitimate business need to process your personal information, we will delete or anonymise such information where reasonably possible. Where immediate deletion is not possible, such as when information is stored in backup archives, we will securely store the information and isolate it from further processing until deletion is possible.
            </p>

            {/* Section 7 */}
            <h2 id="section-7" className="text-2xl font-semibold mt-8 mb-4">
              7. HOW DO WE KEEP YOUR INFORMATION SAFE?
            </h2>
            <p className="mb-4">
              <strong>In Short:</strong> We aim to protect your personal information through appropriate organisational and technical security measures.
            </p>
            <p className="mb-4">
              We have implemented reasonable technical and organisational security measures designed to protect the personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
            </p>
            <p className="mb-4">
              We therefore cannot guarantee that hackers, cybercriminals, or other unauthorised third parties will never be able to defeat our security measures or improperly collect, access, steal, or modify your information. Although we will make reasonable efforts to protect your personal information, transmission of personal information to and from our Services is undertaken at your own risk. You should access our Services within a secure environment.
            </p>

            {/* Section 8 */}
            <h2 id="section-8" className="text-2xl font-semibold mt-8 mb-4">
              8. DO WE COLLECT INFORMATION FROM MINORS?
            </h2>
            <p className="mb-4">
              <strong>In Short:</strong> We do not knowingly collect or market personal information from children under 18 years of age.
            </p>
            <p className="mb-4">
              We do not knowingly collect or solicit personal information from children under 18 years of age or knowingly market our Services to them. If we learn that personal information from a person under 18 has been collected without appropriate consent, we will take reasonable measures to review and delete such information where required. If you believe that we may have collected personal information from a person under 18, please contact us at <a href="mailto:info@eklabya.com" className="text-blue-600 dark:text-blue-400 underline">info@eklabya.com</a>.
            </p>

            {/* Section 9 */}
            <h2 id="section-9" className="text-2xl font-semibold mt-8 mb-4">
              9. WHAT ARE YOUR PRIVACY RIGHTS?
            </h2>
            <p className="mb-4">
              <strong>In Short:</strong> Depending on your location and applicable law, you may have certain rights regarding your personal information.
            </p>
            <p className="mb-2">Depending on applicable privacy laws, you may have rights that include:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>The right to request access to your personal information</li>
              <li>The right to request correction of inaccurate or incomplete information</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to request restriction of processing in certain circumstances</li>
              <li>The right to object to certain processing</li>
              <li>The right to withdraw consent where processing is based on consent</li>
              <li>The right to request information about how your personal information is processed</li>
            </ul>
            <h3 className="font-bold text-lg mt-4 mb-2">Withdrawing Your Consent</h3>
            <p className="mb-4">
              If we rely on your consent to process your personal information, you may withdraw your consent at any time by contacting us using the contact details provided in this Privacy Notice. Withdrawal of consent will not affect the lawfulness of processing carried out before the withdrawal. It may also not affect processing based on other lawful grounds where permitted by applicable law.
            </p>
            <h3 className="font-bold text-lg mt-4 mb-2">Account Information</h3>
            <p className="mb-2">If you would like to review, update, or terminate your account, you may:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Log in to your account settings and update your account information, where available.</li>
              <li>Contact us using the contact information provided below.</li>
            </ul>
            <p className="mb-4">
              Upon a valid request to terminate your account, we may deactivate or delete your account and information from our active databases, subject to applicable legal, regulatory, security, fraud-prevention, or legitimate business requirements. For questions or requests relating to your privacy rights, please email <a href="mailto:info@eklabya.com" className="text-blue-600 dark:text-blue-400 underline">info@eklabya.com</a>.
            </p>

            {/* Section 10 */}
            <h2 id="section-10" className="text-2xl font-semibold mt-8 mb-4">
              10. CONTROLS FOR DO-NOT-TRACK FEATURES
            </h2>
            <p className="mb-4">
              Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting that can signal a preference regarding online tracking. At this stage, there is no universally accepted technical standard for recognising and implementing DNT signals. Accordingly, we may not currently respond to DNT browser signals or similar mechanisms that automatically communicate your choice not to be tracked online. If applicable standards or legal requirements change, we may update this practice through a revised version of this Privacy Notice.
            </p>

            {/* Section 11 */}
            <h2 id="section-11" className="text-2xl font-semibold mt-8 mb-4">
              11. DO WE MAKE UPDATES TO THIS NOTICE?
            </h2>
            <p className="mb-4">
              <strong>In Short:</strong> Yes, we may update this Privacy Notice from time to time.
            </p>
            <p className="mb-4">
              We may update this Privacy Notice as necessary to reflect changes in our Services, business practices, technology, or applicable legal requirements. The updated version will be indicated by an updated "Last Updated" date at the top of this Privacy Notice. If we make material changes, we may notify you by prominently posting a notice on our website or by other appropriate means where required. We encourage you to review this Privacy Notice periodically to stay informed about how we protect your personal information.
            </p>

            {/* Section 12 */}
            <h2 id="section-12" className="text-2xl font-semibold mt-8 mb-4">
              12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
            </h2>
            <p className="mb-4">
              If you have questions, comments, or concerns about this Privacy Notice or our privacy practices, you may contact us at:
            </p>
            <address className="not-italic mb-4">
              Eklabya<br />
              H-161 BSI, Sector-63, Noida<br />
              Gautam Budh Nagar, Uttar Pradesh 201301<br />
              India<br />
              Email: <a href="mailto:info@eklabya.com" className="text-blue-600 dark:text-blue-400 underline">info@eklabya.com</a>
            </address>

            {/* Section 13 */}
            <h2 id="section-13" className="text-2xl font-semibold mt-8 mb-4">
              13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
            </h2>
            <p className="mb-4">
              You may have the right to request access to the personal information we collect from you, request correction of inaccurate information, request deletion of your personal information, or withdraw consent where applicable. To request to review, update, or delete your personal information, please contact us at: <a href="mailto:info@eklabya.com" className="text-blue-600 dark:text-blue-400 underline">info@eklabya.com</a>. We will review and respond to valid requests in accordance with applicable data protection and privacy laws. Some requests may be subject to identity verification and applicable legal limitations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;