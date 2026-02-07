package com.nekonihongo.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nekonihongo.backend.entity.GrammarQuestion;
import com.nekonihongo.backend.repository.GrammarQuestionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
public class GrammarQuestionControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private GrammarQuestionRepository grammarQuestionRepository;

    private MockMvc mockMvc;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    public void testGetQuestionsByLessonId() throws Exception {
        // Test with lessonId parameter
        mockMvc.perform(get("/api/grammar/mini-test/questions")
                .param("lessonId", "4")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    public void testGetQuestionsByLessonIdLegacy() throws Exception {
        // Test with lesson_id parameter (legacy)
        mockMvc.perform(get("/api/grammar/mini-test/questions")
                .param("lesson_id", "4")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    public void testGetQuestionsWithoutLessonId() throws Exception {
        // Test without lessonId parameter
        mockMvc.perform(get("/api/grammar/mini-test/questions")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
}