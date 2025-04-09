    //  <Modal visible={!!selectedScan} transparent animationType="slide">
    //     <View style={styles.modalOverlay}>
    //       <View style={styles.modalContent}>
    //         <ScrollView>
    //           {/* Back Button in Modal */}
    //           <TouchableOpacity
    //             style={{ padding: 16 }}
    //             onPress={() => setSelectedScan(null)}
    //           >
    //             <Ionicons name="arrow-back" size={24} color="#333" />
    //           </TouchableOpacity>

    //           {/* Image */}
    //           <Image
    //             source={{ uri: selectedScan?.image_url }}
    //             style={{ width: "100%", height: 240, resizeMode: "cover" }}
    //           />

    //           {/* Price Tag */}
    //           {selectedScan?.metadata?.rewind_price && (
    //             <View
    //               style={{
    //                 position: "absolute",
    //                 top: 210,
    //                 right: 20,
    //                 backgroundColor: "#CDE990",
    //                 paddingVertical: 6,
    //                 paddingHorizontal: 14,
    //                 borderRadius: 20,
    //                 shadowColor: "#000",
    //                 shadowOffset: { width: 0, height: 2 },
    //                 shadowOpacity: 0.3,
    //                 shadowRadius: 4,
    //                 elevation: 5,
    //               }}
    //             >
    //               <Text
    //                 style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}
    //               >
    //                 $
    //                 {Number(
    //                   selectedScan.metadata.rewind_price
    //                 ).toLocaleString()}
    //               </Text>
    //             </View>
    //           )}

    //           {/* Description */}
    //           {selectedScan?.metadata?.description && (
    //             <Text
    //               style={{
    //                 padding: 20,
    //                 fontSize: 15,
    //                 color: "#666",
    //                 lineHeight: 22,
    //               }}
    //             >
    //               {selectedScan.metadata.description}
    //             </Text>
    //           )}

    //           {/* Two Columns of Details */}
    //           <View style={{ flexDirection: "row", paddingHorizontal: 20 }}>
    //             <View style={{ flex: 1, marginRight: 10 }}>
    //               <DetailItem
    //                 label="Style"
    //                 value={selectedScan?.metadata?.style}
    //               />
    //               <DetailItem
    //                 label="Period"
    //                 value={selectedScan?.metadata?.period}
    //               />
    //               <DetailItem
    //                 label="Manufacturer"
    //                 value={selectedScan?.metadata?.manufacturer}
    //               />
    //               <DetailItem
    //                 label="Materials"
    //                 value={
    //                   Array.isArray(selectedScan?.metadata?.materials)
    //                     ? selectedScan?.metadata?.materials.join(", ")
    //                     : selectedScan?.metadata?.materials
    //                 }
    //               />
    //             </View>

    //             <View style={{ flex: 1, marginLeft: 10 }}>
    //               <DetailItem
    //                 label="Country of Origin"
    //                 value={selectedScan?.metadata?.place_of_origin}
    //               />
    //               <DetailItem
    //                 label="Condition"
    //                 value={selectedScan?.metadata?.condition}
    //               />
    //               <DetailItem
    //                 label="Dimensions"
    //                 value={selectedScan?.metadata?.dimensions}
    //               />
    //               <DetailItem
    //                 label="Provenance Date"
    //                 value={selectedScan?.metadata?.provenance_date}
    //               />
    //             </View>
    //           </View>

    //           {/* Reference Info */}
    //           <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
    //             <DetailItem
    //               label="Reference Number"
    //               value={selectedScan?.metadata?.reference_number}
    //             />
    //             <DetailItem
    //               label="Seller Location"
    //               value={selectedScan?.metadata?.seller_location}
    //             />
    //           </View>

    //           {/* External Link */}
    //           {selectedScan?.metadata?.link && (
    //             <TouchableOpacity
    //               onPress={() => Linking.openURL(selectedScan.metadata.link)}
    //               style={{
    //                 backgroundColor: "#CDE990",
    //                 margin: 20,
    //                 borderRadius: 12,
    //                 paddingVertical: 14,
    //                 alignItems: "center",
    //               }}
    //             >
    //               <Text
    //                 style={{ fontWeight: "bold", fontSize: 16, color: "#333" }}
    //               >
    //                 View Product
    //               </Text>
    //             </TouchableOpacity>
    //           )}
    //         </ScrollView>
    //       </View>
    //     </View>
    //   </Modal>