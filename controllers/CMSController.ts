import { databases } from '@/lib/appwrite/config';
import { ID } from 'appwrite';

export class CMSController {
  private static readonly DATABASE_ID = 'your_database_id';
  private static readonly COLLECTION_ID = 'cms_content';

  static async updateHomeSlider(slides: any[]) {
    try {
      return await databases.updateDocument(
        this.DATABASE_ID,
        this.COLLECTION_ID,
        'home_slider',
        { slides }
      );
    } catch (error) {
      throw error;
    }
  }

  static async updateAboutSection(content: any) {
    try {
      return await databases.updateDocument(
        this.DATABASE_ID,
        this.COLLECTION_ID,
        'about_section',
        content
      );
    } catch (error) {
      throw error;
    }
  }

  static async updateServices(services: any[]) {
    try {
      return await databases.updateDocument(
        this.DATABASE_ID,
        this.COLLECTION_ID,
        'services',
        { services }
      );
    } catch (error) {
      throw error;
    }
  }

  static async updateContactInfo(content: any) {
    try {
      return await databases.updateDocument(
        this.DATABASE_ID,
        this.COLLECTION_ID,
        'contact_section',
        content
      );
    } catch (error) {
      throw error;
    }
  }

  static async updateTestimonials(testimonials: any[]) {
    try {
      return await databases.updateDocument(
        this.DATABASE_ID,
        this.COLLECTION_ID,
        'testimonials',
        { testimonials }
      );
    } catch (error) {
      throw error;
    }
  }

  static async getHomeContent() {
    try {
      const queries = [
        databases.getDocument(this.DATABASE_ID, this.COLLECTION_ID, 'home_slider'),
        databases.getDocument(this.DATABASE_ID, this.COLLECTION_ID, 'about_section'),
        databases.getDocument(this.DATABASE_ID, this.COLLECTION_ID, 'services'),
        databases.getDocument(this.DATABASE_ID, this.COLLECTION_ID, 'contact_section'),
        databases.getDocument(this.DATABASE_ID, this.COLLECTION_ID, 'testimonials')
      ];

      const [slider, about, services, contact, testimonials] = await Promise.all(queries);

      return {
        slider,
        about,
        services,
        contact,
        testimonials
      };
    } catch (error) {
      throw error;
    }
  }
}