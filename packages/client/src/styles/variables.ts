import { css } from 'styled-components'
import { inputSelectDarkModeHack } from '../components/form/styles'

export const colorvars = css`
  &:root {
    --base-opacity-06: rgba(0, 0, 0, 0.06);

    --primary-50: hsl(207, 70%, 91%);
    --primary-100: hsl(207, 70%, 87%);
    --primary-200: hsl(207, 70%, 79%);
    --primary-300: hsl(207, 70%, 62%);
    --primary-400: hsl(207, 70%, 51%);
    --primary-500: hsl(208, 71%, 42%);
    --primary-600: hsl(208, 71%, 34%);
    --primary-700: hsl(208, 71%, 30%);
    --primary-800: hsl(207, 70%, 25%);
    --primary-900: hsl(207, 70%, 18%);

    --purple-50: hsl(270, 100%, 98%);
    --purple-100: hsl(270, 100%, 95%);
    --purple-200: hsl(269, 100%, 92%);
    --purple-300: hsl(269, 97%, 85%);
    --purple-400: hsl(270, 95%, 75%);
    --purple-500: hsl(271, 91%, 65%);
    --purple-600: hsl(271, 81%, 56%);
    --purple-700: hsl(272, 72%, 47%);
    --purple-800: hsl(273, 67%, 39%);
    --purple-900: hsl(274, 66%, 32%);
    
    --tertiary-30: hsl(0, 0%, 99%);
    --tertiary-50: hsl(0, 0%, 98%);
    --tertiary-70: hsl(0, 0%, 94%);
    --tertiary-100: hsl(210, 4%, 93%);
    --tertiary-200: hsl(210, 4%, 88%); 
    --tertiary-250: hsl(202, 11%, 80%);
    --tertiary-300: hsl(0, 0%, 74%); 
    --tertiary-400: hsl(240, 5%, 65%);
    --tertiary-500: hsl(200, 4%, 40%); 
    --tertiary-600: hsl(230, 5%, 34%);
    --tertiary-700: hsl(240, 5%, 26%);
    --tertiary-800: hsl(240, 4%, 16%);
    --tertiary-900: hsl(240, 6%, 10%);

    --success-50: hsl(136, 73%, 97%);
    --success-100: hsl(142, 83%, 93%);
    --success-200: hsl(141, 79%, 85%);
    --success-300: hsl(142, 77%, 73%);
    --success-400: hsl(142, 69%, 58%);
    --success-500: hsl(142, 76%, 43%);
    --success-600: hsl(142, 76%, 36%);
    --success-700: hsl(142, 72%, 29%);
    --success-800: hsl(143, 61%, 27%);
    --success-900: hsl(144, 63%, 18%);

    --highlight-50: hsl(55, 92%, 95%);
    --highlight-100: hsl(55, 97%, 88%);
    --highlight-200: hsl(53, 98%, 77%);
    --highlight-300: hsl(50, 98%, 64%);
    --highlight-400: hsl(48, 96%, 53%);
    --highlight-500: hsl(45, 93%, 47%);
    --highlight-600: hsl(41, 96%, 40%);
    --highlight-700: hsl(35, 92%, 33%);
    --highlight-800: hsl(32, 81%, 29%);
    --highlight-900: hsl(28, 73%, 26%);

    --warning-50: hsl(0, 87%, 97%);
    --warning-100: hsl(0, 94%, 94%);
    --warning-200: hsl(0, 96%, 89%);
    --warning-300: hsl(0, 93%, 82%);
    --warning-400: hsl(0, 97%, 71%);
    --warning-500: hsl(0, 84%, 60%);
    --warning-600: hsl(0, 72%, 51%);
    --warning-700: hsl(0, 74%, 42%);
    --warning-800: hsl(0, 70%, 35%);
    --warning-900: hsl(0, 63%, 31%);
  }
  
  html[data-theme="dark"] {
    &:root {
      --base-opacity-06: rgba(255, 255, 255, 0.06);

      --primary-50: hsl(207, 70%, 18%);
      --primary-100: hsl(207, 70%, 25%);
      --primary-200: hsl(208, 71%, 30%);
      --primary-300: hsl(208, 71%, 38%);
      --primary-400: hsl(208, 71%, 42%);
      --primary-500: hsl(207, 70%, 51%);
      --primary-600: hsl(207, 70%, 62%);
      --primary-700: hsl(207, 70%, 79%);
      --primary-800: hsl(207, 70%, 87%);
      --primary-900: hsl(207, 70%, 91%);

      --purple-50: hsl(274, 50%, 19%);
      --purple-100: hsl(274, 59%, 28%);
      --purple-200: hsl(272, 72%, 47%);
      --purple-300: hsl(272, 82%, 59%);
      --purple-400: hsl(270, 100%, 67%);
      --purple-500: hsl(278, 100%, 75%);
      --purple-600: hsl(286, 100%, 81%);
      --purple-700: hsl(300, 100%, 87%);
      --purple-800: hsl(300, 100%, 92%);
      --purple-900: hsl(300, 100%, 97%);

      --tertiary-30: hsl(0, 0%, 11%);
      --tertiary-50: hsl(0, 0%, 15%);
      --tertiary-70: hsl(0, 0%, 17%);
      --tertiary-100: hsl(0, 0%, 20%);
      --tertiary-200: hsl(0, 0%, 26%);
      --tertiary-250: hsl(0, 0%, 30%);
      --tertiary-300: hsl(0, 0%, 37%);
      --tertiary-400: hsl(0, 0%, 45%);
      --tertiary-500: hsl(0, 0%, 53%);
      --tertiary-600: hsl(0, 0%, 61%);
      --tertiary-700: hsl(0, 0%, 73%);
      --tertiary-800: hsl(0, 0%, 84%);
      --tertiary-900: hsl(0, 0%, 94%);
      
      --success-50: hsl(136, 59%, 13%);
      --success-100: hsl(144, 61%, 20%);
      --success-200: hsl(143, 64%, 24%);
      --success-300: hsl(142, 80%, 32%);
      --success-400: hsl(142, 71%, 45%);
      --success-500: hsl(142, 69%, 58%);
      --success-600: hsl(142, 77%, 73%);
      --success-700: hsl(141, 79%, 85%);
      --success-800: hsl(142, 83%, 93%);
      --success-900: hsl(136, 73%, 97%);

      --highlight-50: hsl(55, 47%, 17%);
      --highlight-100: hsl(32, 81%, 29%);
      --highlight-200: hsl(35, 92%, 33%);
      --highlight-300: hsl(41, 96%, 40%);
      --highlight-400: hsl(45, 93%, 47%);
      --highlight-500: hsl(48, 96%, 53%);
      --highlight-600: hsl(50, 98%, 64%);
      --highlight-700: hsl(53, 98%, 77%);
      --highlight-800: hsl(55, 96%, 90%);
      --highlight-900: hsl(55, 92%, 95%);

      --warning-50: hsl(0, 45%, 25%);
      --warning-100: hsl(0, 59%, 30%);
      --warning-200: hsl(0, 46%, 47%);
      --warning-300: hsl(0, 69%, 55%);
      --warning-400: hsl(0, 91%, 63%);
      --warning-500: hsl(0, 100%, 69%);
      --warning-600: hsl(0, 100%, 79%);
      --warning-700: hsl(0, 100%, 83%);
      --warning-800: hsl(0, 100%, 87%);
      --warning-900: hsl(0, 96%, 91%);
    }
  }
`

export const themes = css`
&:root {
  --site-header-height: 50px;

  --c-property-item: hsl(35, 79%, 83%);
  --c-brand-dnanexus: #28AAE1;
}

&:root {
  --base: hsl(0, 0%, 20%);
  --background: var(--tertiary-50);
  --background-shaded: var(--tertiary-200); // shadedBG
  --c-layout-border: var(--tertiary-300); //borderDefault
  --c-layout-border-200: var(--tertiary-200);
  --c-dropdown-menu-border: var(--c-layout-border-200);
  --c-dropdown-menu-text-disabled: #939a9d;

  --c-text-700: var(--tertiary-700); //textDarkGrey
  --c-text-600: var(--tertiary-600);
  --c-text-500: var(--tertiary-500); // textMediumGrey
  --c-text-400: var(--tertiary-400); // textDarkGreyInactive
  --c-text-300: var(--tertiary-300);
  --c-text-100: var(--tertiary-100);

  --c-link: var(--primary-500);
  --c-link-hover: var(--primary-400);

  --c-loading-primary: hsl(0, 0%, 93%);
  --c-loading-secondary: hsl(0, 0%, 86%);

  --c-dropdown-bg: var(--tertiary-50);
  --c-dropdown-hover-bg: var(--tertiary-100);
  --c-dropdown-active-bg: var(--tertiary-200);

  --c-scrollbar: rgba(193, 200, 212, 0.8);
  --c-scrollbar-2: rgba(193, 200, 212, 1);

  --c-input-border: var(--tertiary-250);
  --c-textarea-bg: var(--tertiary-100);

  --c-app-header-bg: #343E4D;
  --c-app-header-bg-active: #424c5a;
  --c-app-header-bg-hover: #4F5C6E;
  --c-app-header-menu-base: var(--tertiary-200);
  --c-app-header-menu-hover:var(--tertiary-50);
  --c-app-header-menu-active-bg: #2f5373;

  --c-discussion-answer-bg: #fdfcf2;
  --c-discussion-answer-500: #ac8f43;
  --c-discussion-answer-300: #e4c472;
  
  --c-footer-bg: #f4f8fd;
}

html[data-theme="dark"] {
  &:root {
    --c-layout-border: hsl(0, 0%, 29%);
    --c-layout-border-200: hsl(0, 0%, 23%);
    --background: hsl(0, 0%, 12%);
    --background-shaded: hsl(199 4% 15%);
    --c-bg-300: #212326;
    --base: hsl(0, 0%, 80%);

    --c-text-700: var(--tertiary-700);
    --c-text-600: var(--tertiary-600);
    --c-text-500: var(--tertiary-500);
    --c-text-400: var(--tertiary-400);
    --c-text-300: var(--tertiary-300);
    --c-text-100: var(--tertiary-100);

    --c-link: var(--primary-500);
    --c-link-hover: var(--primary-600);

    --c-loading-primary: hsl(0, 0%, 13%);
    --c-loading-secondary: hsl(0, 0%, 26%);

    --c-dropdown-bg: hsl(199 4% 15%);
    --c-dropdown-hover-bg: hsl(199 4% 19%);
    --c-dropdown-menu-border: var(--c-layout-border-200);

    --c-scrollbar: rgba(88, 88, 88, 0.5);
    --c-scrollbar-2: rgba(103, 102, 102, 0.6);

    --c-input-border: var(--tertiary-250);
    --c-textarea-bg: var(--tertiary-50);
    
    --c-app-header-bg: var(--background);
    --c-app-header-bg-active: var(--tertiary-100);
    --c-app-header-bg-hover:var(--tertiary-100);
    --c-app-header-border: var(--c-layout-border);
    --c-app-header-menu-base: var(--base);
    --c-app-header-menu-hover: var(--tertiary-200);
    --c-app-header-menu-active-bg: var(--primary-500);

    --c-discussion-answer-bg: #32312d;
    --c-discussion-answer-500: #ba983e;
    --c-discussion-answer-300: #7a6633;

    --c-modal-border: var(--c-layout-border);
  }

  ${inputSelectDarkModeHack}
}

`

