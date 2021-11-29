import { StatusCodes } from 'http-status-codes';
import { API_ROUTES } from '@graasp/query-client';
import { getItemById, isChild } from '../../src/utils/item';
import { MEMBERS } from '../fixtures/members';
import { ID_FORMAT, parseStringToRegExp, EMAIL_FORMAT } from './utils';
import { DEFAULT_GET } from '../../src/api/utils';
import { getS3FileExtra } from '../../src/utils/itemExtra';

const {
  buildGetChildrenRoute,
  buildGetItemRoute,
  buildGetMemberBy,
  GET_CURRENT_MEMBER_ROUTE,
  buildDownloadFilesRoute,
  buildGetS3MetadataRoute,
} = API_ROUTES;

const API_HOST = Cypress.env('API_HOST');

export const mockGetCurrentMember = (
  currentMember = MEMBERS.ANNA,
  shouldThrowError = false,
) => {
  cy.intercept(
    {
      method: DEFAULT_GET.method,
      url: `${API_HOST}/${GET_CURRENT_MEMBER_ROUTE}`,
    },
    ({ reply }) => {
      if (shouldThrowError) {
        return reply({ statusCode: StatusCodes.BAD_REQUEST, body: null });
      }

      // avoid sign in redirection
      return reply(currentMember);
    },
  ).as('getCurrentMember');
};

export const mockGetItem = ({ items, currentMember }, shouldThrowError) => {
  cy.intercept(
    {
      method: DEFAULT_GET.method,
      url: new RegExp(`${API_HOST}/${buildGetItemRoute(ID_FORMAT)}$`),
    },
    ({ url, reply }) => {
      const itemId = url.slice(API_HOST.length).split('/')[2];
      const item = getItemById(items, itemId);

      // item does not exist in db
      if (!item) {
        return reply({
          statusCode: StatusCodes.NOT_FOUND,
        });
      }

      // mock membership
      const creator = item?.creator;
      const haveMembership =
        creator === currentMember.id ||
        item.memberships?.find(({ memberId }) => memberId === currentMember.id);

      if (shouldThrowError || !haveMembership) {
        return reply({ statusCode: StatusCodes.UNAUTHORIZED, body: null });
      }

      return reply({
        body: item,
        statusCode: StatusCodes.OK,
      });
    },
  ).as('getItem');
};

export const mockGetChildren = (items) => {
  cy.intercept(
    {
      method: DEFAULT_GET.method,
      url: new RegExp(`${API_HOST}/${buildGetChildrenRoute(ID_FORMAT)}`),
    },
    ({ url, reply }) => {
      const id = url.slice(API_HOST.length).split('/')[2];
      const children = items.filter(isChild(id));
      reply(children);
    },
  ).as('getChildren');
};

export const mockGetMemberBy = (members, shouldThrowError) => {
  cy.intercept(
    {
      method: DEFAULT_GET.method,
      url: new RegExp(
        `${API_HOST}/${parseStringToRegExp(buildGetMemberBy(EMAIL_FORMAT))}`,
      ),
    },
    ({ reply, url }) => {
      if (shouldThrowError) {
        return reply({ statusCode: StatusCodes.BAD_REQUEST });
      }

      const emailReg = new RegExp(EMAIL_FORMAT);
      const mail = emailReg.exec(url)[0];
      const member = members.find(({ email }) => email === mail);

      return reply([member]);
    },
  ).as('getMemberBy');
};

export const mockDefaultDownloadFile = (items, shouldThrowError) => {
  cy.intercept(
    {
      method: DEFAULT_GET.method,
      url: new RegExp(`${API_HOST}/${buildDownloadFilesRoute(ID_FORMAT)}$`),
    },
    ({ reply, url }) => {
      if (shouldThrowError) {
        reply({ statusCode: StatusCodes.BAD_REQUEST });
        return;
      }

      const id = url.slice(API_HOST.length).split('/')[2];
      const { filepath } = items.find(({ id: thisId }) => id === thisId);
      reply({ fixture: filepath });
    },
  ).as('downloadFile');
};

export const mockGetS3Metadata = (items, shouldThrowError) => {
  cy.intercept(
    {
      method: DEFAULT_GET.method,
      url: new RegExp(`${API_HOST}/${buildGetS3MetadataRoute(ID_FORMAT)}$`),
    },
    ({ reply, url }) => {
      if (shouldThrowError) {
        reply({ statusCode: StatusCodes.BAD_REQUEST });
        return;
      }

      const id = url.slice(API_HOST.length).split('/')[2];
      const { extra } = items.find(({ id: thisId }) => id === thisId);

      reply(getS3FileExtra(extra));
    },
  ).as('getS3Metadata');
};

// bug: mockGetS3FileContent intercept static/js/bundle.js which fails tests