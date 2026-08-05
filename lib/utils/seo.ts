export const generateMedicalWebPageSchema = (title: string, description: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: title,
    description: description,
    mainEntity: {
      '@type': 'MedicalBusiness',
      name: 'BloodLink - Blood Donation Platform',
      url: 'https://bloodlink.com',
      telephone: '+1-800-BLOOD-LINK',
      areaServed: 'Worldwide',
      serviceType: 'Blood Donation',
    },
    medicalAudience: {
      '@type': 'Audience',
      audienceType: 'Patients, Blood Donors, Healthcare Providers',
    },
  };
};

export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BloodLink',
    description: 'Real-time blood donation platform connecting donors and recipients',
    url: 'https://bloodlink.com',
    logo: 'https://bloodlink.com/logo.png',
    sameAs: [
      'https://twitter.com/bloodlink',
      'https://facebook.com/bloodlink',
      'https://instagram.com/bloodlink',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Emergency Support',
      telephone: '+1-800-BLOOD-LINK',
      email: 'emergency@bloodlink.com',
    },
  };
};
