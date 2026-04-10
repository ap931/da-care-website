export const homePageQuery = `*[_type == "homePage" && _id == "homePage"][0]{
  hero{
    eyebrow,
    title,
    description,
    primaryCta{label, href},
    secondaryCta{label, href}
  },
  noise{
    text1,
    text2,
    text3
  },
  products{
    leda{
      pill,
      title,
      description,
      primaryCta{label, href},
      secondaryCta{label, href}
    },
    ledaWork{
      pill,
      title,
      description,
      primaryCta{label, href},
      secondaryCta{label, href}
    },
    coren{
      pill,
      title,
      description,
      primaryCta{label, href},
      secondaryCta{label, href}
    }
  },
  obsolete{
    label,
    heading,
    items[]{number, line}
  },
  about{
    label,
    heading,
    body,
    stats[]{number, label}
  },
  theme{
    coral,
    coralDark,
    coralLight,
    mint,
    mintDark,
    mintLight,
    sky,
    skyDark,
    skyLight,
    textPrimary,
    textSecondary,
    textTertiary,
    textDisabled,
    bgWhite,
    bgSubtle,
    surface,
    borderDefault,
    borderLight
  }
}`;

export const siteSettingsQuery = `*[_type == "siteSettings" && _id == "siteSettings"][0]{
  brand{
    "logoUrl": logo.asset->url,
    "logoAlt": coalesce(logo.alt, "da.care")
  },
  navigation[]{label, href, newTab},
  footerNavigation[]{label, href, newTab},
  footerLegal[]{label, href, newTab},
  socialLinks[]{label, href, newTab}
}`;

export const aboutPageQuery = `*[_type == "aboutPage" && _id == "aboutPage"][0]{
  hero{
    title,
    description,
    cta{label, href},
    background{
      "url": asset->url,
      "alt": alt
    }
  },
  manifesto{
    title,
    body
  },
  values{
    title,
    items[]{term, definition}
  },
  origin{
    title,
    paragraphs[]
  },
  breakoutImage{
    "url": asset->url,
    "alt": alt
  },
  working{
    title,
    items[]{title, body}
  },
  teamSpirit{
    title,
    paragraph1,
    linkPrefix,
    linkLabel,
    linkHref
  }
}`;

export const contactPageQuery = `*[_type == "contactPage" && _id == "contactPage"][0]{
  hero{
    title,
    description,
    cta{label, href}
  },
  locations[]{
    name,
    line1,
    line2,
    line3
  },
  faq{
    title,
    items[]{question, answer}
  }
}`;

export const ledaBusinessPageQuery = `*[_type == "ledaBusinessPage" && _id == "ledaBusinessPage"][0]{
  hero{
    badge,
    titlePrefix,
    titleAccent,
    subtitle,
    primaryCta{label, href},
    secondaryCta{label, href},
    trust[]{text},
    image{
      "url": asset->url,
      "alt": alt
    }
  },
  dividers{
    features,
    problem,
    howItWorks,
    why,
    ecosystem,
    pricing
  },
  features{
    label,
    title,
    intro,
    items[]{icon, title, body}
  },
  problem{
    label,
    title,
    intro,
    cards[]{tag, value, description}
  },
  howItWorks{
    label,
    title,
    intro,
    steps[]{index, title, body},
    image{
      "url": asset->url,
      "alt": alt
    }
  },
  why{
    label,
    title,
    intro,
    cards[]{ghost, icon, title, label, body}
  },
  ecosystem{
    label,
    title,
    intro,
    rows[]{title, tag, body}
  },
  pricing{
    pill,
    title,
    intro,
    cards[]{
      badge,
      tier,
      price,
      note,
      description,
      features[]{text},
      cta{label, href}
    },
    footnote
  }
}`;

export const corenPageQuery = `*[_type == "corenPage" && _id == "corenPage"][0]{
  hero{
    title,
    subtitle,
    primaryCta{label, href},
    secondaryCta{label, href},
    trust[]{text},
    card{
      badge,
      tags[]{text},
      cta{label, href},
      fitLabel
    }
  },
  opportunity{
    cards[]{title, icon, subtitle, body},
    stats[]{number, caption}
  },
  howItWorks{
    label,
    title,
    intro,
    steps[]{icon, title, body}
  },
  pricing{
    title,
    subtitle,
    card{
      title,
      subtitle,
      price,
      label,
      featuresLabel,
      groups[]{
        category,
        items[]{text}
      },
      cta{label, href}
    }
  },
  faq{
    title,
    items[]{question},
    ctaText
  },
  profile{
    card{
      matchLabel,
      tags[]{text},
      details[]{text},
      availabilityLabel,
      slots[]{text},
      cta{label, href}
    },
    content{
      label,
      title,
      body,
      checklist[]{text},
      cta{label, href}
    }
  },
  matching{
    label,
    title,
    body,
    cta{label, href},
    card{
      title,
      score,
      rows[]{label, points}
    }
  },
  trust{
    illustration,
    label,
    title,
    body,
    features[]{icon, title, body}
  },
  analytics{
    label,
    title,
    body,
    metrics[]{icon, number, label, trend},
    cta{
      text,
      link{label, href}
    },
    performance{
      title,
      rows[]{label, value}
    },
    score{
      title,
      rows[]{label, value}
    }
  },
  finalCta{
    title,
    body,
    cta{label, href}
  }
}`;

export const ledaPageQuery = `*[_type == "ledaPage" && _id == "ledaPage"][0]{
  hero{
    title,
    description,
    cta{label, href},
    background{
      "url": asset->url,
      "alt": alt
    }
  },
  splitVideo{
    title,
    body,
    video
  },
  benefits{
    items[]{
      image{ "url": asset->url, "alt": alt },
      icon{ "url": asset->url, "alt": alt },
      title,
      body,
      overlay
    }
  },
  apps{
    image{ "url": asset->url, "alt": alt },
    titleLine1,
    titleLine2,
    body,
    label,
    logos[]{ "url": asset->url, "alt": alt }
  },
  modules{
    items[]{
      image{ "url": asset->url, "alt": alt },
      icon{ "url": asset->url, "alt": alt },
      body
    }
  },
  bento{
    row1Title,
    row1Body,
    row2Title,
    row2Body,
    row3Title,
    tickerLabel
  },
  privacy{
    title,
    body,
    card{ name, id, context },
    stations{ user, encrypt, security, strip, ai }
  },
  finalCta{
    title,
    body,
    cta{label, href},
    image{ "url": asset->url, "alt": alt }
  }
}`;

export const articlesQuery = `*[_type == "article"] | order(order asc){
  "id": slug,
  title,
  date,
  readTime,
  excerpt,
  "image": image{ "url": asset->url, "alt": alt },
  "thumbnail": thumbnail{ "url": asset->url, "alt": alt },
  content[]{
    type,
    text,
    image{ "url": asset->url, "alt": alt }
  }
}`;
