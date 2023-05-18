import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { postProduct, postStock, bulkInsertProducts } from '@/fetching/postData';
import { InputGroup, IconButton,HStack, useToast, Link, Stack, FormControl, FormLabel, Text, Button, Card, Collapse, Box, Input, InputLeftElement, Flex,Table, Thead, Tbody, Tr, Th, Td, Select, Heading, VStack, Badge, Image, useColorMode} from "@chakra-ui/react";
import { allProducts, allVendors, allWarehouses, allCategories} from './allData';
import { FiSearch, FiEdit,FiUpload, FiPlus, FiArrowLeft, FiArrowRight, FiMaximize, FiDelete, FiDivideCircle } from 'react-icons/fi';
import { deleteProduct } from '@/fetching/deleteData';
import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, Accordion
,ModalBody,AccordionItem,AccordionButton,AccordionIcon,AccordionPanel, Icon } from '@chakra-ui/react';
//Parent
function Product() {
  const [dummyState, setDummyState] = useState(0); // Create dummy state
  
  const [filters, setFilters] = useState({
    warehouse_id: '',
    category_id: '',
    vendor_id: '',
    page: 1,
    limit: 10,
    q: '',
    sort: ''
  });
  const { data, setData, isLoading, error } = allProducts({ filters, dummyState });
  const { products, totalItems, totalPages, currentPage } = data;
  const { warehouses } = allWarehouses();

  function handleAddProduct(details) {
    setData(prevData => ({
      ...prevData,
      products: [...prevData.products, details]
    }));
    setDummyState(prevState => prevState + 1); // Update dummy state
  }

  function handleApplyFilters() {
    setDummyState(prevState => prevState + 1);
  }

  const { vendors } = allVendors();
  const { category} = allCategories();


  return(
    <Box>
      <FilterForm 
      filters={filters} 
      setFilters={setFilters} 
      handleApplyFilters={handleApplyFilters}
      warehouses={warehouses}
      vendors={vendors} 
      category={category}
      pageOptions={Array.from({length: totalPages}, (_, i) => i + 1)}
      totalItems={totalItems}
      data={data}
      setData={setData}
      />
      <Stack>
      <AddProductForm category={category} handleAddProduct={handleAddProduct} />
      <AddStockForm 
      data={data} 
      setData={setData} 
      handleAddProduct={handleAddProduct}
      warehouses={warehouses}
      vendors={vendors}/>
      </Stack>
    </Box>
  )
  
}
export default Product;

//Add Product
export const AddProductForm = ({ handleAddProduct, category }) => {
  const [details, setDetails] = useState({
    name: '',
    price: 0,
    weight: 0,
    size: '',
    description: '',
    SKU: '',
    category_id: 0,
    image: ''
  })
  
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();
  
  const handleSubmit = async (e) => {
    const accessToken = sessionStorage.getItem('accessToken');
      e.preventDefault();
      handleAddProduct(details);
      try {
        await postProduct(
          details.name,
          details.price,
          details.weight,
          details.size,
          details.description,
          details.SKU,
          details.category_id,
          details.image,
          accessToken
        );
        setDetails({
          name: '',
          price: 0,
          weight: 0,
          size: '',
          description: '',
          SKU: '',
          category_id: 0,
          image: ''
        });
        toast({
          title: 'Product created.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        } catch (err) {
          toast({
            title: 'Failed to create product.',
            description: err.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setDetails((prev) => {
        return { ...prev, [name]: value};
    });
  };

  const handleImageChange = (e) => {
    setDetails((prev) => {
      return { ...prev, image: e.target.files[0] };
    });
  };

  return (
    <Box>
      <Card mt={4} bgColor="transparent" borderRadius={10}>
        <Button as={FiPlus} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Cancel' : '+ Product'}
        </Button>
        <Collapse in={isOpen} animateOpacity>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <Input
              placeholder="Name"
              name="name"
              value={details.name}
              onChange={handleChange}
              mb={4}
            />
            <Input
              placeholder="Price"
              name="price"
              value={details.price}
              onChange={handleChange}
              mb={4}
            />
            <Input
              placeholder="Weight"
              name="weight"
              value={details.weight}
              onChange={handleChange}
              mb={4}
            />
            <Input
              placeholder="Size"
              name="size"
              value={details.size}
              onChange={handleChange}
              mb={4}
            />
            <Input
              placeholder="Description"
              name="description"
              value={details.description}
              onChange={handleChange}
              mb={4}
            />
            <Input
              placeholder="SKU"
              name="SKU"
              value={details.SKU}
              onChange={handleChange}
              mb={4}
            />
            <Select
              placeholder="Select category"
              name="category_id"
              value={details.category_id}
              onChange={handleChange}
              mb={4}
            >
              {category.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              mb={4}
            />
            <Button type="submit" colorScheme="green">
              Submit
            </Button>
          </form>
        </Collapse>
      </Card>
    </Box>
  );
};

//Bulk Add Product
export const BulkInsertForm = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const {colorMode} = useColorMode();

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = sessionStorage.getItem('accessToken');
    setIsLoading(true);
    try {
      await bulkInsertProducts(file, accessToken);
      setFile(null);
      toast({
        title: 'Bulk insert successful',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to perform bulk insert',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const buttonCollor = colorMode === 'dark' ? '#7289da' : '#3bd1c7';

  return (
    <>
      <Button backgroundColor={buttonCollor} onClick={onOpen}>
        Bulk Insert
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Bulk Insert Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div style={{ display: 'flex' }}>
              <img src="https://img.freepik.com/free-vector/checking-boxes-concept-illustration_114360-2465.jpg?w=740&t=st=1684387560~exp=1684388160~hmac=e225f2314b5666af1ce71c24159d0e45587d38a74f171444232d2e4243fef2a1" alt="Restock" style={{ marginRight: '20px' }} />
              <div>
                <Accordion defaultIndex={[0]} allowMultiple>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left" colorScheme="teal">
                        Rule 1: Data Format
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      The data in the file should be formatted in a specific way...
                    </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Rule 2: Data Validation
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      Validate the data for any required fields, constraints, or business rules...
                    </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Rule 3: Error Handling
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      Handle any errors that occur during the bulk insert process...
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <FormControl mt={4}>
                <FormLabel htmlFor="file">
                  <Icon as={FiUpload} boxSize={6} mr={2} />
                </FormLabel>
                <Input type="file" id="file" accept=".csv" onChange={handleChange} />
              </FormControl>
              <Button type="submit" justifyContent="center" colorScheme="teal" mt={4} isLoading={isLoading} loadingText="Uploading">
                Upload
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

//Add Stock Form
export const AddStockForm = ({ data, setData, warehouses, vendors, handleAddProduct }) => {
  //data needed: products , vendors, warehouses
    
    const toast = useToast();
    const [isOpen, setIsOpen] = useState(false);
    
    const [details, setDetails] = useState({
      product_id: 0,
      quantity: 0,
      vendor_id: 1,
      warehouse_id: 1
    })
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      if (value === '') {
        setDetails((prev) => ({ ...prev, [name]: 0 }));
      } else {
        const quantity = parseInt(value);
        setDetails((prev) => ({ ...prev, [name]: quantity }));
      }
    };
    
    const handleSubmit = async (e) => {
        const accessToken = sessionStorage.getItem('accessToken');
          e.preventDefault();
          handleAddProduct(details);
          try {
            await postStock(
              details.product_id,
              details.quantity,
              details.vendor_id,
              details.warehouse_id,
              accessToken
            );
            setDetails({
              product_id: 0,
              quantity: 1,
              vendor_id: 0,
              warehouse_id: 0
            });
            setData(prevData => ({
              ...prevData,
              products: [...prevData.products, details]
            }));
            toast({
              title: 'Stocks Added.',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          } catch (err) {
            toast({
              title: 'Failed to add stocks.',
              description: err.message,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
    };
    return (
          <Box>
            <Button as={FiMaximize} onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? 'Cancel' : '+ Stocks'}
            </Button>
            <Collapse in={isOpen} animateOpacity>
              <form onSubmit={handleSubmit}>
                <h3>Product</h3>{' '}
                  <select
                    name='product_id'
                    value={details.product_id}
                    onChange={handleChange}
                  >
                    {data.products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                <h3>Quantity</h3>{' '}
                <input
                  type='text'
                  name='quantity'
                  value={details.quantity}
                  onChange={handleChange}
                ></input>
                
                <h3>Vendor</h3>{' '}
                <select
                    name='vendor_id'
                    value={details.vendor_id}
                    onChange={handleChange}
                  >
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                </select>
                <h3>Warehouse</h3>{' '}
                <select
                  name='warehouse_id'
                  value={details.warehouse_id}
                  onChange={handleChange}
                >
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
                <Button type='submit'>Submit</Button>
              </form>
            </Collapse>
          </Box>
    );
};

//filter and render component
function FilterForm({ filters, setFilters, warehouses, vendors, category, totalItems, handleApplyFilters, pageOptions, data, setData}) {
  //category.categories
  const toast = useToast();
  const router = useRouter();
  const limitOptions = [
    { label: "5", value: 5 },
    { label: "10", value: 10 },
    { label: "15", value: 15 },
    { label: "20", value: 20 },
  ];

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'page') {
      onPageChange({ ...filters, [name]: value });
    } else {
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value
      }));
    }
  };
  //warehouses[]
  function handleSubmit(e) {
    e.preventDefault();
    handleApplyFilters();
  };

  const handleClearFilters = () => {
    setFilters({ q: "", warehouse: "", vendor: "", page: 1, category:"",sort:'' });
  };

  function renderProduct(data) {
    return data.map((p) => {
      const warehousesForProduct = p.Warehouses ? p.Warehouses.map((w) => ({
        id: p.id,
        name: w.name,
        WarehouseStock: w.WarehouseStock,
      })) : [];

      const totalQuantity = warehousesForProduct.reduce((acc, w) => acc + w.WarehouseStock.quantity, 0);

      const vendorsForProduct = p.Vendors ? p.Vendors.map((v) => ({
        id: p.id,
        name: v.name,
      })) : [];

      const warehouseSelect =
        warehousesForProduct.length > 1 ? (
          <Select variant="unstyled">
            {warehousesForProduct.map((w) => (
              <option key={w.name}>
                {w.name} Q({w.WarehouseStock.quantity})
              </option>
            ))}
          </Select>
        ) : (
          <span>
            {warehousesForProduct[0]?.name} ({warehousesForProduct[0]?.WarehouseStock.quantity})
          </span>
        );

      const vendorSelect =
        vendorsForProduct.length > 1 ? (
          <Select variant="unstyled">
            {vendorsForProduct.map((v) => (
              <option key={v.name}>{v.name}</option>
            ))}
          </Select>
        ) : (
          <span>{vendorsForProduct[0]?.name}</span>
        );


        function handleDelete(productId) {
          const accessToken = sessionStorage.getItem('accessToken');
          deleteProduct(productId, accessToken)
            .then(() => {
              toast({
                title: 'Product deleted',
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
              setData((prevData) => ({ ...prevData, products: prevData.products.filter((p) => p.id !== productId) }));
            })
            .catch((error) => {
              toast({
                title: 'Error deleting product',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
              });
            });
        }

        const handleProductDetails = (productId) => {
          router.push(`/products/${productId}`)
        }
        return (
          <Tr key={p.id}>
            <Td>
            <HStack>
            <Link
              onClick={() => handleProductDetails(p.id)}
              _hover={{
                textDecoration: 'glow',
                textShadow: '0 0 8px #fff, 0 0 12px #fff, 0 0 16px #fff',
              }}
            >
              {p.name}
              <Text fontSize="sm" color="gray.500" ml={1} display="inline">
              <FiEdit />
              </Text>
            </Link>
            </HStack>
              </Td>
              <Td>
              {p.Categories && p.Categories.map((c) => (
                <span key={c.id}>{c.name}</span>
              ))}
            </Td> 

            <Td>{warehouseSelect}</Td>
            <Td>{vendorSelect}</Td>
            <Td>{totalQuantity}</Td>
            <Td>
            <Image src={p.image}boxSize="50px" objectFit="cover" />
            </Td>
            <Td>
              <Button leftIcon={<FiDivideCircle />} onClick={() => handleDelete(p.id)}>Delete</Button>
            </Td>
          </Tr>
        );
    });
  };
  
  function PageSelect({ filters, pageOptions, onPageChange }) {
    function handleChange(event) {
      const { name, value } = event.target;
      onPageChange({ ...filters, [name]: value });
    }
    function handlePrevPage() {
      if (filters.page > 1) {
        onPageChange({ ...filters, page: filters.page - 1 });
      }
    }
  
    function handleNextPage() {
      if (filters.page < pageOptions.length) {
        onPageChange({ ...filters, page: filters.page + 1 });
      }
    }
    
    return (
      <Flex alignItems="center">
        <IconButton
          icon={<FiArrowLeft />}
          aria-label="Previous page"
          onClick={handlePrevPage}
          mr={2}
        />
        <Select
          id="page"
          name="page"
          value={filters.page}
          onChange={handleChange}
          flex={1}
        >
          {pageOptions.map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </Select>
        <IconButton
          icon={<FiArrowRight />}
          aria-label="Next page"
          onClick={handleNextPage}
          ml={2}
        />
      </Flex>
    );
  }
  
    
  
  const tableBody = renderProduct(data.products);
  
  return (
    <form onSubmit={handleSubmit}>
    <HStack spacing={4} alignItems="flex-end">
    <Box flex="1">
    <Flex alignItems="center">
    <InputGroup mr={2}>
      <InputLeftElement pointerEvents="none" />
      <Select
        type="text"
        name="warehouse_id"
        value={filters.warehouse_id}
        onChange={handleChange}
        placeholder='Select Warehouse'
      >
        {warehouses.map((w) => {
          return (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          );
        })}
      </Select>

    </InputGroup>
    <InputGroup mr={2}>
      <InputLeftElement pointerEvents="none"/>
      <Select
        type="text"
        name="category_id"
        value={filters.category_id}
        onChange={handleChange}
        placeholder='Select Category'
      >
        {category.categories.map((c) => {
          return (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          );
        })}
      </Select>
    </InputGroup>
    <InputGroup mr={2}>
      <InputLeftElement pointerEvents="none"/>
      <Select
        type="text"
        name="vendor_id"
        value={filters.vendor_id}
        onChange={handleChange}
        placeholder='Select Vendor'
      >
        {vendors.map((v) => {
          return (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          );
        })}
      </Select>
    </InputGroup>
    </Flex>
    <Stack direction={{ base: 'column', md: 'row' }} spacing="4">
      <FormControl>
        <FormLabel htmlFor="q">Search</FormLabel>
        <Input
          type="text"
          id="q"
          name="q"
          value={filters.q}
          onChange={handleChange}
          placeholder="Search products"
        />
      </FormControl>
      
    </Stack>
    <Flex align="center" justify="center" direction="column" top="0"
      bottom="0"
      left="0"
      right="0">
        <Heading as="h2" size="lg" mb="4">
          Product List
        </Heading>
        <Table>
          <Thead style={{ position: "sticky", top: 0 }}>
            <Tr>
              <Th>Lists</Th>
              <Th>Category</Th>
              <Th>Warehouse</Th>
              <Th>Vendor</Th>
              <Th>Quantity</Th>
            </Tr>
          </Thead>
          <Tbody>{tableBody}</Tbody>
        </Table>
      </Flex>
      <HStack>
      <FormControl>
        <FormLabel htmlFor="limit">Limit</FormLabel>
        <Select id="limit" name="limit" value={filters.limit} onChange={handleChange}>
          {limitOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label} ({totalItems > 0 ? Math.min(totalItems, option.value) : 0} items)
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl>
      <FormLabel htmlFor="page">Page</FormLabel>
      <PageSelect filters={filters} pageOptions={pageOptions} onPageChange={setFilters} />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="sort">Sort</FormLabel>
        <Select
          id="sort"
          name="sort"
          value={filters.sort}
          onChange={handleChange}
        >
          <option value="">None</option>
          <option value="name:ASC">Name (A-Z)</option>
          <option value="name:DESC">Name (Z-A)</option>
        </Select>
      </FormControl>
      </HStack>
  </Box>
    <VStack>
    <Button type="submit" leftIcon={<FiSearch />}>
      Apply filters
    </Button>
    
    <Button 
    onClick={handleClearFilters}
    leftIcon={<FiDelete />}
    >
      Clear Filters
      </Button>
    </VStack>
    
    </HStack>
    </form>

  );
}

//low Stock alert
export const LowStockAlert = ({ data }) => {
  const hasLowStock = (product) => {
    return product.Warehouses.some((warehouse) => warehouse.WarehouseStock.quantity < 10);
  };

  return (
    <Box p={4} shadow="md" borderWidth="1px" borderRadius="md" overflowY="auto">
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        Low Stock Alert
      </Text>
      {data.map((product) => (
        hasLowStock(product) && (
          <Box key={product.id} mb={2}>
            <Text>{product.name}</Text>
            <Badge colorScheme="red" variant="subtle" ml={2}>
              Low Stock
            </Badge>
            <Text size="sm" color="gray.400">
              at {product.Warehouses.filter((warehouse) => warehouse.WarehouseStock.quantity < 10).map((warehouse) => warehouse.name).join(", ")}
            </Text>
          </Box>
        )
      ))}
    </Box>
  );
};




