export type Publication = {
  id: string;
  title: string;
  /** Optional image in public/, e.g. '/publications/paper.webp'. */
  image?: string;
  authors: string[];
  link: string;
  publisher: string;
  date: string;
  conference: string;
  doi: string;
  abstract: string;
};

// Empty on purpose: the section shows "Publications coming soon." until an entry is added.
export const publications: Publication[] = [
  // {
  //   id: 'example-paper',
  //   title: 'Title of the paper',
  //   image: '/publications/example.webp',
  //   authors: ['Tristan Morton', 'A. Coauthor'],
  //   link: 'https://doi.org/10.0000/example',
  //   publisher: 'Publisher name',
  //   date: 'Mar 2027',
  //   conference: 'Name of the conference',
  //   doi: '10.0000/example',
  //   abstract: 'The full abstract. The card shows the first lines and a "Read Full Abstract" toggle.',
  // },
];
