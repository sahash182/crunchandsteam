// Site-wide settings. Edit here; every page reads from this file.
// Leave a social link as '' to hide its icon/button until the account exists.

export const site = {
  name: 'Crunch & Steam',
  url: 'https://crunchandsteam.vercel.app',
  tagline: 'Crunchy fried chicken. Steamy momo. Bold Nepalese flavours.',
  area: 'Erina Fair, Central Coast NSW',
  social: {
    instagram: 'https://www.instagram.com/crunchnsteam/',
    facebook: '',  // e.g. 'https://facebook.com/crunchnsteam' once the Page exists
    tiktok: 'https://www.tiktok.com/@crunchnsteam',
    youtube: '',   // 'https://www.youtube.com/@crunchnsteam' once the handle is set in YouTube Studio
  },
  // Customer reviews on the home page. Keep false until you have real reviews to show
  // (then replace src/data/testimonials.js with them and set this to true).
  showReviews: false,
  // Added to the "Order online" link on /links so you can see which orders came from social.
  linkInBioUtm: 'utm_source=instagram&utm_medium=social&utm_campaign=link_in_bio',
}
