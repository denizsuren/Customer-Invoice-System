package com.pia.telekom.service;

import com.pia.telekom.dto.ProductResponse;
import com.pia.telekom.entity.Product;
import com.pia.telekom.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getProductId(),
                product.getName(),
                product.getCategory(),
                product.getMonthlyFee(),
                product.getDataLimitGb(),
                product.getVoiceLimitMin(),
                product.getTierLevel(),
                product.getSubscriptionType()
        );
    }
}
