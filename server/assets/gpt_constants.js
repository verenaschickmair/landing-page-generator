export const UI_LIBRARY = `Use only Flowbite Tailwind CSS components and Tailwind CSS classes to create the landing page.
  For this, use the following minified stylesheet inside the head tag:
  <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.css" rel="stylesheet" /> and
  <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.js"></script> before the closing body tag.`;

export const COMPONENTS = `1. Header Section: Include a logo and a navigation menu.
  2. Hero Section: Create a captivating headline and a call-to-action button. Use a random image related to the prompt for the background image, generating it with the URL "https://source.unsplash.com/featured/1280x720/?{description}" (replace {description} with a relevant keyword).
  3. Feature Section: Showcase three standout feature cards with eye-catching featured icons from the Fontawesome CDN icon library. Apply subtle CSS animations, such as fade-in or slide-in effects using Animate.css, to enhance visual appeal.
  4. Feature Sections: Create a separate section for each feature card. Each section should include a captivating title, description, and a call-to-action button. Use a random image related to the prompt for the background image, generating it with the URL "https://source.unsplash.com/featured/1280x720/?{description}" (replace {description} with a relevant keyword). You can float the image to the left or right of the text.
  5. Testimonial Section: Display two testimonials with names, roles, and feedback. Apply a CSS animation, like fade-in or slide-in animation using Animate.css, to reveal testimonials when scrolled into view.
  6. Blog Section: Include a section that displays recent blog posts with a title, short description, and a "Read More" link.
  7. FAQ Section: Add a section for frequently asked questions and answers.
  8. Team Section: Showcase the team with photos, names, roles, and social media links.
  9. Newsletter Subscription: Add a section for users to subscribe to a newsletter.
  10. Contact Form Section: Create fields for name, email, and message.
  12. Footer Section: Add links to social media profiles, utilizing the Fontawesome CDN icon library for social media icons.`;

export const GUIDLINES = `1. Refer to the company colors if given. Add more suitable colors if just one or two are given.
  2. Mind to use dark text on light backgrounds and light text on dark backgrounds.;
  3. Use the same margin/padding values for each section.
  4. Mind to keep the hero section with the image bigger than other sections to make it stand out.
  4. Please add an unique ID to each header/footer/section element in the HTML code.
  5. You must use a single-page layout.
  6. Mind to only use images from Unsplash and the Fontawesome CDN icon library. Do not use image sources like "logo.png" or "image.jpg" as they are not available in this local environment.
  7. Choose a layout and components that best suits the given company data. If you choose a component, design and fill it suitable to the obtained company data.
  8. Please ensure the HTML code is valid and properly structured, incorporating the necessary CDN links for Fontawesome icons, Animate.css, and any additional CSS or JS files.
  9. Use the CDN link for Tailwind CSS: <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.7/tailwind.min.css" rel="stylesheet" />
  10. Remember to keep the design minimalistic, intuitive, and visually appealing. Mind a consistent design and layout throughout the page.
  11. Avoid "Lorem Ipsum" text and use the given company data instead to write content to make the landing page more realistic.
  12. Don't leave any component/section empty. Write content for each component/section used!.
  13. Choose images by using the URL "https://source.unsplash.com/featured/1280x720/?{description}" (replace {description} with a relevant keyword)
  14. Use the language of the company/campaign data to write the content for the landing page.`;

export const FUNDAMENTAL_PRACTICES = `Use a clear and concise value statement (above the fold) so visitors understand the purpose of your page immediately.
  Match your primary headline to the ad your visitor clicked to land on the page in the first place (or the button of the email CTA, for example).
  Include social proof and testimonials to back up your claims.
  Focus the whole page on a single offer, with just one primary call to action (CTA).
  Use a conversion-centered layout to make your CTA stand out (think about whitespace, color, contrast, and directional cues).`;
