import React from "react";
import SEO from "../components/SEO";

const PaymentTAndC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <SEO 
        title="Payment Terms & Conditions | FirstVITE"
        description="Review our payment terms and conditions. Understand your rights and responsibilities when making payments on FirstVITE's learning platform."
        keywords="payment terms, payment conditions, refund policy, online payment terms, FirstVITE payment, course payment terms"
        og={{
          title: 'Payment Terms & Conditions | FirstVITE',
          description: 'Understand the terms and conditions governing payments on the FirstVITE platform. Learn about refunds, payment methods, and your financial responsibilities.',
          type: 'article'
        }}
      />
      <div className="max-w-3xl mx-auto p-4 text-black dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Payment Terms & Conditions</h2>
      <p className="mb-4">
        By making this payment, I hereby confirm that the funds used for this
        transaction belong solely to me and have been lawfully earned by me
        through legitimate means. I am making this payment voluntarily and of my
        own free will, without any coercion, pressure, or compulsion from any
        party.
      </p>
      <p className="mb-4">
        I fully understand and accept that I am solely responsible for the
        source and usage of these funds. In the event of any legal, financial,
        or other issues arising from this payment, I acknowledge that the entire
        responsibility lies with me and I shall not hold the company or its
        representatives accountable in any manner.
      </p>
      <p className="mb-4">
        I also understand that payments made are final and non-refundable unless
        explicitly stated otherwise in a written agreement or refund policy
        shared by the company. It is my responsibility to review all relevant
        information and policies before proceeding with the payment.
      </p>
      <p className="mb-4">
        I agree to comply with all applicable laws, regulations, and policies
        related to digital payments and financial transactions. I certify that
        this payment does not violate any local, national, or international law.
      </p>
      <h3 className="text-xl font-bold mb-4">Refund Policy</h3>
      <p className="mb-4">
        Any scholarship admission is non-refundable.
      </p>
      <p className="mb-4">
        Registration amount is non-refundable.
      </p>
      <p className="mb-4">
        If the student gets access and is allocated a batch, the fee is non-refundable.
      </p>
      <p className="mb-4">
        By completing this transaction, I acknowledge that I have read,
        understood, and agreed to all the terms and conditions mentioned above.
      </p>
      </div>
    </div>
  );
};

export default PaymentTAndC;
