export class CreateCategoryDto {
  title: string;

  description: string;

  html: string;

  constructor(title: string, description: string, html: string) {
    this.title = title;
    this.description = description;
    this.html = html;
  }
}
