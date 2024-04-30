// Mock the chrome API
const chrome = {
  commands: {
    onCommand: {
      addListener: jest.fn(),
    },
  },
  notifications: {
    create: jest.fn(),
  },
};

// Import the background.js file
const background = require('./background');

describe('performSearch', () => {
  beforeEach(() => {
    // Reset the mock functions before each test
    chrome.commands.onCommand.addListener.mockReset();
    chrome.notifications.create.mockReset();
  });

  test('should display a notification when "Alt + S" is pressed', () => {
    // Simulate pressing the "Alt + S" key combination
    chrome.commands.onCommand.addListener.mock.calls[0][0]('alt+s');

    // Verify that a notification is displayed
    expect(chrome.notifications.create).toHaveBeenCalledWith(
      expect.any(String), // Notification ID
      {
        type: 'basic',
        title: 'Search Notification',
        message: 'Alt + S was pressed!',
        iconUrl: 'path/to/icon.png',
      }
    );
  });
});