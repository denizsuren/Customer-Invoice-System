package com.pia.telekom.service;

import com.pia.telekom.dto.RegionResponse;
import com.pia.telekom.entity.Region;
import com.pia.telekom.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RegionService {

    private final RegionRepository regionRepository;

    public List<RegionResponse> getAllRegions() {
        return regionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private RegionResponse toResponse(Region region) {
        return new RegionResponse(
                region.getRegionId(),
                region.getName(),
                region.getCityType(),
                region.getPopulationWeight()
        );
    }
}