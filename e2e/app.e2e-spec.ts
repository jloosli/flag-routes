import { FlagRoutesNewPage } from './app.po';

describe('flag-routes-new App', () => {
  let page: FlagRoutesNewPage;

  beforeEach(() => {
    page = new FlagRoutesNewPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
