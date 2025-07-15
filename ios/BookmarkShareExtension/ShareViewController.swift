import UIKit
import Social
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    // IMPORTANT: This must match the App Group ID you created in Xcode
    let appGroupId = "group.org.reactjs.native.example.BookmarksApp"
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

        var bookmarks: [String] = []
        
        // 1. Read the existing JSON string
        if let jsonString = userDefaults.string(forKey: userDefaultsKey) {
            // 2. Try to decode it
            if let data = jsonString.data(using: .utf8),
               let decodedBookmarks = try? JSONDecoder().decode([String].self, from: data) {
                bookmarks = decodedBookmarks
            }
        }
        
        // 3. Append the new URL
        bookmarks.append(url.absoluteString)
        
        // 4. Re-encode to JSON
        if let data = try? JSONEncoder().encode(bookmarks),
           let jsonString = String(data: data, encoding: .utf8) {
            // 5. Save the new JSON string
            userDefaults.set(jsonString, forKey: userDefaultsKey)
            print("Bookmark JSON saved: \(jsonString)")
        }
    }

    private func dismissExtension() {
        DispatchQueue.main.async {
            self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }
    }
}
