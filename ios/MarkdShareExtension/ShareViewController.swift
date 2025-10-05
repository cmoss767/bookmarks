import UIKit
import Social
import UniformTypeIdentifiers

// Bookmark struct that matches the TypeScript interface
struct Bookmark: Codable {
    let id: String
    let title: String
    let url: String
    let tags: [String]
    let createdAt: Int64
}

class ShareViewController: UIViewController {

    // IMPORTANT: This must match the App Group ID you created in Xcode
    let appGroupId = "group.com.chrismoss.Markd"
    let userDefaultsKey = "bookmarks"

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        // Process the shared item and dismiss the view
        processSharedItem()
    }

    private func processSharedItem() {
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let itemProvider = extensionItem.attachments?.first else {
            self.dismissExtension()
            return
        }
        
        let urlType = UTType.url.identifier
        
        if itemProvider.hasItemConformingToTypeIdentifier(urlType) {
            itemProvider.loadItem(forTypeIdentifier: urlType, options: nil) { [weak self] (item, error) in
                guard let self = self else { return }
                
                if let sharedUrl = item as? URL {
                    self.saveBookmark(url: sharedUrl)
                }
                
                self.dismissExtension()
            }
        } else {
            // If no URL is found, just close
            self.dismissExtension()
        }
    }

    private func saveBookmark(url: URL) {
        // Access shared UserDefaults via App Group
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            print("Failed to access UserDefaults with App Group ID: \(appGroupId)")
            return
        }

        var bookmarks: [Bookmark] = []
        
        // 1. Read the existing JSON string
        if let jsonString = userDefaults.string(forKey: userDefaultsKey) {
            if let data = jsonString.data(using: .utf8) {
                // Try to decode as new Bookmark format first
                if let decodedBookmarks = try? JSONDecoder().decode([Bookmark].self, from: data) {
                    bookmarks = decodedBookmarks
                } else if let decodedStrings = try? JSONDecoder().decode([String].self, from: data) {
                    // Backward compatibility: convert old string format to new Bookmark format
                    bookmarks = decodedStrings.map { urlString in
                        createBookmarkFromUrl(urlString)
                    }
                    print("Converted \(decodedStrings.count) old bookmarks to new format")
                }
            }
        }
        
        // 2. Create new bookmark
        let newBookmark = createBookmarkFromUrl(url.absoluteString)
        bookmarks.append(newBookmark)
        
        // 3. Save the updated bookmarks array
        if let data = try? JSONEncoder().encode(bookmarks),
           let jsonString = String(data: data, encoding: .utf8) {
            userDefaults.set(jsonString, forKey: userDefaultsKey)
            print("Bookmark saved successfully. Total bookmarks: \(bookmarks.count)")
        } else {
            print("Failed to encode bookmarks")
        }
    }
    
    private func createBookmarkFromUrl(_ urlString: String) -> Bookmark {
        // Generate a simple ID (similar to the TypeScript generateId function)
        let id = String(Int64(Date().timeIntervalSince1970 * 1000), radix: 36) + String(Int.random(in: 0...999999), radix: 36)
        
        // Extract title from URL (similar to extractTitleFromUrl in TypeScript)
        let title = extractTitleFromUrl(urlString)
        
        return Bookmark(
            id: id,
            title: title,
            url: urlString,
            tags: [],
            createdAt: Int64(Date().timeIntervalSince1970 * 1000)
        )
    }
    
    private func extractTitleFromUrl(_ urlString: String) -> String {
        guard let url = URL(string: urlString) else { return urlString }
        let hostname = url.host ?? urlString
        return hostname.replacingOccurrences(of: "www.", with: "")
    }

    private func dismissExtension() {
        DispatchQueue.main.async {
            self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }
    }
}
